import { prisma } from "../../lib/prisma";
import { TOP_FIVE_LEAGUE_IDS, CURRENT_SEASON } from "../../lib/sync/scope";
import { syncPlayerMetrics } from "../../scripts/sync/player-metrics";

const PREMIER_LEAGUE_TRANSFERMARKT_ID = "GB1";
const MINIMUM_KNOWN_SEASON_GAMES = 10;

interface InjurySummary {
  careerInjuries: number;
  careerGamesMissed: number;
  careerDaysInjured: number;

  seasonGamesMissed: number;
  seasonDaysInjured: number;

  seasonAbsencePercentage: number | null;
  careerAbsencePercentage: number | null;

  recurrentWarning: boolean;
  recurrentGroup: string | null;
  recurrentCount: number;
}

interface AvailabilityComparison {
  id: string;
  seasonAbsencePercentage: number | null;
}

interface AvailabilityRank {
  rank: number | null;
  total: number;
}

function getSeasonArgument(): string {
  const argument = process.argv.find((value) => value.startsWith("--season="));

  return argument?.split("=")[1]?.trim() || CURRENT_SEASON;
}

function percentile(
  value: number | null,
  comparisonValues: number[],
): number | null {
  if (value === null || comparisonValues.length <= 1) {
    return null;
  }

  const lowerValues = comparisonValues.filter(
    (comparisonValue) => comparisonValue < value,
  ).length;

  return Math.round((lowerValues / (comparisonValues.length - 1)) * 100);
}

function minutesRank(
  minutesPlayed: number,
  comparisonMinutes: number[],
): number | null {
  if (comparisonMinutes.length === 0) {
    return null;
  }

  return (
    comparisonMinutes.filter(
      (comparisonValue) => comparisonValue > minutesPlayed,
    ).length + 1
  );
}

/**
 * This is an estimated absence rate because the database does not
 * currently contain a complete club-fixture table.
 *
 * Formula:
 * games missed / (appearances + games missed)
 */
function calculateAbsencePercentage(
  gamesMissed: number,
  appearances: number,
  minimumKnownGames = 1,
): number | null {
  const knownGames = gamesMissed + appearances;

  if (knownGames < minimumKnownGames) {
    return null;
  }

  return Number(((gamesMissed / knownGames) * 100).toFixed(1));
}

function getInjuryGroup(description: string): string | null {
  const normalized = description.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (normalized.includes("hamstring") || normalized.includes("ham-string")) {
    return "Hamstring";
  }

  if (normalized.includes("groin") || normalized.includes("adductor")) {
    return "Groin/adductor";
  }

  if (
    normalized.includes("knee") ||
    normalized.includes("meniscus") ||
    normalized.includes("cruciate") ||
    normalized.includes("acl") ||
    normalized.includes("mcl")
  ) {
    return "Knee";
  }

  if (normalized.includes("ankle") || normalized.includes("achilles")) {
    return "Ankle/Achilles";
  }

  if (normalized.includes("calf") || normalized.includes("lower leg")) {
    return "Calf/lower leg";
  }

  if (
    normalized.includes("thigh") ||
    normalized.includes("quadriceps") ||
    normalized.includes("quad injury")
  ) {
    return "Thigh";
  }

  if (normalized.includes("back") || normalized.includes("spine")) {
    return "Back";
  }

  if (normalized.includes("hip") || normalized.includes("pelvis")) {
    return "Hip/pelvis";
  }

  if (normalized.includes("foot") || normalized.includes("toe")) {
    return "Foot/toe";
  }

  if (normalized.includes("shoulder") || normalized.includes("arm")) {
    return "Shoulder/arm";
  }

  if (
    normalized.includes("wrist") ||
    normalized.includes("hand") ||
    normalized.includes("finger")
  ) {
    return "Hand/wrist";
  }

  if (normalized.includes("head") || normalized.includes("concussion")) {
    return "Head/concussion";
  }

  if (
    normalized.includes("illness") ||
    normalized.includes("virus") ||
    normalized.includes("infection") ||
    normalized.includes("flu")
  ) {
    return "Illness";
  }

  if (normalized.includes("muscle") || normalized.includes("muscular")) {
    return "Muscle";
  }

  return normalized
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getRecurrentInjury(
  injuries: Array<{
    description: string;
  }>,
): {
  warning: boolean;
  group: string | null;
  count: number;
} {
  const injuryCounts = injuries.reduce<Record<string, number>>(
    (counts, injury) => {
      const group = getInjuryGroup(injury.description);

      if (!group) {
        return counts;
      }

      counts[group] = (counts[group] ?? 0) + 1;

      return counts;
    },
    {},
  );

  const mostFrequentRecurrentInjury = Object.entries(injuryCounts)
    .filter(([, count]) => count >= 2)
    .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)[0];

  if (!mostFrequentRecurrentInjury) {
    return {
      warning: false,
      group: null,
      count: 0,
    };
  }

  const [group, count] = mostFrequentRecurrentInjury;

  return {
    warning: true,
    group,
    count,
  };
}

function calculateAvailabilityRank(
  playerId: string,
  comparisonPlayers: AvailabilityComparison[],
): AvailabilityRank {
  const eligiblePlayers = comparisonPlayers.filter(
    (
      comparisonPlayer,
    ): comparisonPlayer is {
      id: string;
      seasonAbsencePercentage: number;
    } => comparisonPlayer.seasonAbsencePercentage !== null,
  );

  const selectedPlayer = eligiblePlayers.find(
    (comparisonPlayer) => comparisonPlayer.id === playerId,
  );

  if (!selectedPlayer) {
    return {
      rank: null,
      total: eligiblePlayers.length,
    };
  }

  return {
    // A lower injury absence percentage is better.
    rank:
      eligiblePlayers.filter(
        (comparisonPlayer) =>
          comparisonPlayer.seasonAbsencePercentage <
          selectedPlayer.seasonAbsencePercentage,
      ).length + 1,

    total: eligiblePlayers.length,
  };
}

async function main() {
  const season = getSeasonArgument();

  console.log(`📊 Building player metrics for ${season}...`);

  const players = await prisma.player.findMany({
    where: {
      currentClub: {
        is: {
          league: {
            is: {
              transfermarktId: {
                in: [...TOP_FIVE_LEAGUE_IDS],
              },
            },
          },
        },
      },
    },

    select: {
      id: true,
      name: true,
      height: true,
      position: true,
      currentClubId: true,

      currentClub: {
        select: {
          leagueId: true,

          league: {
            select: {
              transfermarktId: true,
            },
          },
        },
      },

      // All seasons are selected because career injury calculations
      // require career appearance totals.
      stats: {
        select: {
          season: true,
          appearances: true,
          minutesPlayed: true,
        },
      },

      injuries: {
        select: {
          season: true,
          description: true,
          startDate: true,
          expectedReturn: true,
          days: true,
          gamesMissed: true,
        },
      },
    },

    orderBy: {
      name: "asc",
    },
  });

  let succeeded = 0;
  let failed = 0;

  const playersWithHeight = players.filter(
    (player): player is typeof player & { height: number } =>
      player.height !== null,
  );

  const overallHeights = playersWithHeight.map((player) => player.height);

  const playersWithMetrics = players.map((player) => {
    const seasonStats = player.stats.filter((stat) => stat.season === season);

    const seasonAppearances = seasonStats.reduce(
      (total, stat) => total + stat.appearances,
      0,
    );

    const careerAppearances = player.stats.reduce(
      (total, stat) => total + stat.appearances,
      0,
    );

    const minutesPlayed = seasonStats.reduce(
      (total, stat) => total + stat.minutesPlayed,
      0,
    );

    const seasonInjuries = player.injuries.filter(
      (injury) => injury.season === season,
    );

    const seasonGamesMissed = seasonInjuries.reduce(
      (total, injury) => total + (injury.gamesMissed ?? 0),
      0,
    );

    const seasonDaysInjured = seasonInjuries.reduce(
      (total, injury) => total + (injury.days ?? 0),
      0,
    );

    const careerGamesMissed = player.injuries.reduce(
      (total, injury) => total + (injury.gamesMissed ?? 0),
      0,
    );

    const careerDaysInjured = player.injuries.reduce(
      (total, injury) => total + (injury.days ?? 0),
      0,
    );

    const recurrentInjury = getRecurrentInjury(player.injuries);

    const injurySummary: InjurySummary = {
      careerInjuries: player.injuries.length,
      careerGamesMissed,
      careerDaysInjured,

      seasonGamesMissed,
      seasonDaysInjured,

      seasonAbsencePercentage: calculateAbsencePercentage(
        seasonGamesMissed,
        seasonAppearances,
        MINIMUM_KNOWN_SEASON_GAMES,
      ),

      careerAbsencePercentage: calculateAbsencePercentage(
        careerGamesMissed,
        careerAppearances,
      ),

      recurrentWarning: recurrentInjury.warning,
      recurrentGroup: recurrentInjury.group,
      recurrentCount: recurrentInjury.count,
    };

    return {
      ...player,
      minutesPlayed,
      seasonAppearances,
      careerAppearances,
      injurySummary,
    };
  });

  const topFiveAvailabilityPlayers: AvailabilityComparison[] =
    playersWithMetrics.map((comparisonPlayer) => ({
      id: comparisonPlayer.id,
      seasonAbsencePercentage:
        comparisonPlayer.injurySummary.seasonAbsencePercentage,
    }));

  const premierLeagueAvailabilityPlayers: AvailabilityComparison[] =
    playersWithMetrics
      .filter(
        (comparisonPlayer) =>
          comparisonPlayer.currentClub?.league?.transfermarktId ===
          PREMIER_LEAGUE_TRANSFERMARKT_ID,
      )
      .map((comparisonPlayer) => ({
        id: comparisonPlayer.id,
        seasonAbsencePercentage:
          comparisonPlayer.injurySummary.seasonAbsencePercentage,
      }));

  for (const [index, player] of playersWithMetrics.entries()) {
    const progress = `[${index + 1}/${playersWithMetrics.length}]`;

    console.log(`${progress} Building metrics for ${player.name}`);

    try {
      const leaguePositionHeights =
        player.position && player.currentClub?.leagueId
          ? playersWithHeight
              .filter(
                (comparisonPlayer) =>
                  comparisonPlayer.position?.toLowerCase() ===
                    player.position?.toLowerCase() &&
                  comparisonPlayer.currentClub?.leagueId ===
                    player.currentClub?.leagueId,
              )
              .map((comparisonPlayer) => comparisonPlayer.height)
          : [];

      const clubMinutes = playersWithMetrics
        .filter(
          (comparisonPlayer) =>
            comparisonPlayer.currentClubId === player.currentClubId,
        )
        .map((comparisonPlayer) => comparisonPlayer.minutesPlayed);

      const leagueMinutes = playersWithMetrics
        .filter(
          (comparisonPlayer) =>
            comparisonPlayer.currentClub?.leagueId ===
            player.currentClub?.leagueId,
        )
        .map((comparisonPlayer) => comparisonPlayer.minutesPlayed);

      const positionMinutes = player.position
        ? playersWithMetrics
            .filter(
              (comparisonPlayer) =>
                comparisonPlayer.position?.toLowerCase() ===
                player.position?.toLowerCase(),
            )
            .map((comparisonPlayer) => comparisonPlayer.minutesPlayed)
        : [];

      const topFiveAvailability = calculateAvailabilityRank(
        player.id,
        topFiveAvailabilityPlayers,
      );

      const premierLeagueAvailability = calculateAvailabilityRank(
        player.id,
        premierLeagueAvailabilityPlayers,
      );

      await syncPlayerMetrics(
        player.id,
        season,
        {
          overall: percentile(player.height, overallHeights),

          position: percentile(player.height, leaguePositionHeights),
        },
        {
          club: minutesRank(player.minutesPlayed, clubMinutes),
          clubTotal: clubMinutes.length,

          league: minutesRank(player.minutesPlayed, leagueMinutes),
          leagueTotal: leagueMinutes.length,

          position: minutesRank(player.minutesPlayed, positionMinutes),
          positionTotal: positionMinutes.length,
        },
        {
          careerInjuries: player.injurySummary.careerInjuries,

          careerGamesMissed: player.injurySummary.careerGamesMissed,

          careerDaysInjured: player.injurySummary.careerDaysInjured,

          seasonGamesMissed: player.injurySummary.seasonGamesMissed,

          seasonDaysInjured: player.injurySummary.seasonDaysInjured,

          seasonInjuryGamesPercentage:
            player.injurySummary.seasonAbsencePercentage,

          careerInjuryGamesPercentage:
            player.injurySummary.careerAbsencePercentage,

          premierLeagueAvailabilityRank: premierLeagueAvailability.rank,

          premierLeagueAvailabilityRankTotal: premierLeagueAvailability.total,

          topFiveAvailabilityRank: topFiveAvailability.rank,

          topFiveAvailabilityRankTotal: topFiveAvailability.total,

          recurrentInjuryWarning: player.injurySummary.recurrentWarning,

          recurrentInjuryGroup: player.injurySummary.recurrentGroup,

          recurrentInjuryCount: player.injurySummary.recurrentCount,
        },
      );

      succeeded++;

      console.log(`${progress} ✓ ${player.name}`);
    } catch (error) {
      failed++;

      console.error(
        `${progress} ✗ Failed for ${player.name} (${player.id})`,
        error,
      );
    }
  }

  console.log("");
  console.log("✅ Metrics build complete");
  console.log(`   Successful: ${succeeded}`);
  console.log(`   Failed:     ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Fatal metrics build error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
