import { prisma } from "@/lib/prisma";

type NumericTeamMetric = {
  clubId: string;
  clubName: string;
  squadSize: number;
  injuryDays: number;
  injuryCount: number;
  playersAffected: Set<string>;
  gamesMissed: number;
  recurrenceWarnings: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  maxAppearances: number;
  matchesCovered: number | null;
  availabilityPercentage: number | null;
  cardsPerMatch: number | null;
};

type Direction = "higher" | "lower";

function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function ordinal(value: number): string {
  const mod100 = value % 100;

  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

function rankTeams(
  teams: NumericTeamMetric[],
  clubId: string,
  getValue: (team: NumericTeamMetric) => number | null,
  direction: Direction,
): { rank: number; teamCount: number } | null {
  const ranked = teams
    .map((team) => ({ team, value: getValue(team) }))
    .filter(
      (entry): entry is { team: NumericTeamMetric; value: number } =>
        entry.value !== null && Number.isFinite(entry.value),
    )
    .sort((a, b) =>
      direction === "higher" ? b.value - a.value : a.value - b.value,
    );

  const index = ranked.findIndex((entry) => entry.team.clubId === clubId);

  if (index === -1) return null;

  return {
    rank: index + 1,
    teamCount: ranked.length,
  };
}

function comparisonToMedian(
  value: number,
  leagueMedian: number,
  unit: string,
): string {
  const difference = value - leagueMedian;

  if (Math.abs(difference) < 0.05) {
    return "At the league median";
  }

  return `${Math.abs(difference).toFixed(1)} ${unit} ${
    difference > 0 ? "above" : "below"
  } league median`;
}

function lowRankText(
  teams: NumericTeamMetric[],
  clubId: string,
  getValue: (team: NumericTeamMetric) => number | null,
): string | undefined {
  const result = rankTeams(teams, clubId, getValue, "lower");

  if (!result) return undefined;

  return `${ordinal(result.rank)}-lowest of ${result.teamCount} teams`;
}

export async function getSquadAvailabilityDiscipline({
  clubId,
  leagueId,
  season,
}: {
  clubId: string;
  leagueId: string;
  season: string;
}) {
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    select: {
      name: true,
      transfermarktId: true,
      clubs: {
        select: {
          id: true,
          name: true,
          transfermarktId: true,
          players: {
            select: {
              id: true,
              metric: {
                select: {
                  recurrentInjuryWarning: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!league || league.clubs.length === 0) return null;

  const clubIds = league.clubs.map((club) => club.id);
  const statClubIds = league.clubs.flatMap((club) =>
    club.transfermarktId ? [club.transfermarktId] : [],
  );
  const internalClubIdByStatClubId = new Map(
    league.clubs.flatMap((club) =>
      club.transfermarktId ? [[club.transfermarktId, club.id] as const] : [],
    ),
  );

  const [injuries, playerStats] = await Promise.all([
    prisma.injury.findMany({
      where: {
        season,
        player: {
          currentClubId: {
            in: clubIds,
          },
        },
      },
      select: {
        playerId: true,
        days: true,
        gamesMissed: true,
        player: {
          select: {
            currentClubId: true,
          },
        },
      },
    }),

    prisma.playerStat.findMany({
      where: {
        season,
        clubId: {
          in: statClubIds,
        },
        ...(league.transfermarktId
          ? { competitionId: league.transfermarktId }
          : { competitionName: league.name }),
      },
      select: {
        clubId: true,
        appearances: true,
        yellowCards: true,
        redCards: true,
        minutesPlayed: true,
      },
    }),
  ]);

  const teamMap = new Map<string, NumericTeamMetric>();

  for (const club of league.clubs) {
    teamMap.set(club.id, {
      clubId: club.id,
      clubName: club.name,
      squadSize: club.players.length,
      injuryDays: 0,
      injuryCount: 0,
      playersAffected: new Set<string>(),
      gamesMissed: 0,
      recurrenceWarnings: club.players.filter(
        (player) => player.metric?.recurrentInjuryWarning,
      ).length,
      yellowCards: 0,
      redCards: 0,
      minutesPlayed: 0,
      maxAppearances: 0,
      matchesCovered: null,
      availabilityPercentage: null,
      cardsPerMatch: null,
    });
  }

  for (const injury of injuries) {
    const injuryClubId = injury.player.currentClubId;
    if (!injuryClubId) continue;

    const team = teamMap.get(injuryClubId);
    if (!team) continue;

    team.injuryDays += injury.days ?? 0;
    team.injuryCount += 1;
    team.gamesMissed += injury.gamesMissed ?? 0;
    team.playersAffected.add(injury.playerId);
  }

  for (const stat of playerStats) {
    if (!stat.clubId) continue;

    const internalClubId = internalClubIdByStatClubId.get(stat.clubId);
    if (!internalClubId) continue;

    const team = teamMap.get(internalClubId);
    if (!team) continue;

    team.yellowCards += stat.yellowCards;
    team.redCards += stat.redCards;
    team.minutesPlayed += stat.minutesPlayed;
    team.maxAppearances = Math.max(team.maxAppearances, stat.appearances);
  }

  const teams = [...teamMap.values()];

  for (const team of teams) {
    // Player minutes should total roughly 11 × 90 for each league match.
    // maxAppearances is a fallback when minute coverage is incomplete.
    const minuteBasedMatches = team.minutesPlayed / (11 * 90);
    const matchesCovered = Math.max(minuteBasedMatches, team.maxAppearances);

    if (matchesCovered <= 0) continue;

    team.matchesCovered = matchesCovered;
    team.cardsPerMatch = (team.yellowCards + team.redCards) / matchesCovered;

    if (team.squadSize > 0) {
      const possiblePlayerMatches = team.squadSize * matchesCovered;
      const unavailableShare = team.gamesMissed / possiblePlayerMatches;

      team.availabilityPercentage = Math.max(
        0,
        Math.min(100, 100 - unavailableShare * 100),
      );
    }
  }

  const selected = teamMap.get(clubId);

  if (
    !selected ||
    selected.availabilityPercentage === null ||
    selected.cardsPerMatch === null
  ) {
    return null;
  }

  const availabilityValues = teams
    .map((team) => team.availabilityPercentage)
    .filter((value): value is number => value !== null);

  const cardsPerMatchValues = teams
    .map((team) => team.cardsPerMatch)
    .filter((value): value is number => value !== null);

  const availabilityRank = rankTeams(
    teams,
    clubId,
    (team) => team.availabilityPercentage,
    "higher",
  );

  const disciplineRank = rankTeams(
    teams,
    clubId,
    (team) => team.cardsPerMatch,
    "lower",
  );

  if (!availabilityRank || !disciplineRank) return null;

  const availabilityMedian = median(availabilityValues);
  const cardsPerMatchMedian = median(cardsPerMatchValues);

  return {
    injury: {
      title: "Injury history",
      headlineLabel: "Estimated squad availability " + season,
      headlineValue: `${selected.availabilityPercentage.toFixed(1)}%`,
      benchmark: {
        rank: availabilityRank.rank,
        teamCount: availabilityRank.teamCount,
        comparisonText: comparisonToMedian(
          selected.availabilityPercentage,
          availabilityMedian,
          "percentage points",
        ),
        favourableLabel: "Less available",
        unfavourableLabel: "More available",
        invertScale: true,
        gradientDirection: "red-to-green",
      },
      rows: [
        {
          label: "Days unavailable",
          value: selected.injuryDays.toLocaleString(),
          comparison: lowRankText(teams, clubId, (team) => team.injuryDays),
        },
        {
          label: "Injuries recorded",
          value: selected.injuryCount.toLocaleString(),
        },
        {
          label: "Players affected",
          value: selected.playersAffected.size.toLocaleString(),
        },
        {
          label: "Players with recurrence warning",
          value: selected.recurrenceWarnings.toLocaleString(),
        },
      ],
      note: "Availability is estimated from reported games missed and current squad size. Injury records are not competition-specific.",
    },

    discipline: {
      title: "Discipline",
      headlineLabel: "Cards per league match " + season,
      headlineValue: selected.cardsPerMatch.toFixed(2),
      benchmark: {
        rank: disciplineRank.rank,
        teamCount: disciplineRank.teamCount,
        comparisonText: comparisonToMedian(
          selected.cardsPerMatch,
          cardsPerMatchMedian,
          "cards per match",
        ),
        favourableLabel: "Fewer cards",
        unfavourableLabel: "More cards",
        gradientDirection: "green-to-red",
      },
      rows: [
        {
          label: "Yellow cards",
          value: selected.yellowCards.toLocaleString(),
          comparison: lowRankText(teams, clubId, (team) => team.yellowCards),
        },
        {
          label: "Red cards",
          value: selected.redCards.toLocaleString(),
          comparison: lowRankText(teams, clubId, (team) => team.redCards),
        },
        {
          label: "Total cards",
          value: (selected.yellowCards + selected.redCards).toLocaleString(),
        },
        {
          label: "League matches covered",
          value: Math.round(selected.matchesCovered ?? 0).toLocaleString(),
        },
      ],
      note: "League match coverage is estimated from player minutes, with maximum appearances used as a fallback.",
    },
  };
}
