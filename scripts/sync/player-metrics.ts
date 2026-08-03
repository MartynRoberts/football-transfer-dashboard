import { prisma } from "@/lib/prisma";

interface HeightPercentiles {
  overall: number | null;
  position: number | null;
}

interface PlayingTimeRanks {
  club: number | null;
  league: number | null;
  position: number | null;
}

interface MarketValuePercentiles {
  worldwide: number | null;
  league: number | null;
  position: number | null;
}

function calculatePercentile(
  values: number[],
  playerValue: number,
): number | null {
  if (values.length === 0) {
    return null;
  }

  const playersAtOrBelow = values.filter(
    (value) => value <= playerValue,
  ).length;

  return Math.round((playersAtOrBelow / values.length) * 100);
}

export async function syncPlayerMetrics(
  playerId: string,
  season: string,
  heightPercentiles: HeightPercentiles,
  playingTimeRanks: PlayingTimeRanks,
) {
  const player = await prisma.player.findUnique({
    where: {
      id: playerId,
    },

    include: {
      currentClub: true,

      stats: {
        where: {
          season,
        },
      },
      injuries: true,

      marketValueHistories: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  if (!player) {
    return;
  }

  const appearances = player.stats.reduce(
    (sum, stat) => sum + stat.appearances,
    0,
  );

  const minutesPlayed = player.stats.reduce(
    (sum, stat) => sum + stat.minutesPlayed,
    0,
  );

  const goals = player.stats.reduce((sum, stat) => sum + stat.goals, 0);

  const assists = player.stats.reduce((sum, stat) => sum + stat.assists, 0);

  const yellowCards = player.stats.reduce(
    (sum, stat) => sum + stat.yellowCards,
    0,
  );

  const redCards = player.stats.reduce((sum, stat) => sum + stat.redCards, 0);

  const currentMarketValue =
    player.marketValueHistories[0]?.marketValue ?? player.marketValue ?? null;

  const previousMarketValue =
    player.marketValueHistories[1]?.marketValue ?? null;

  const marketValueChange =
    currentMarketValue !== null && previousMarketValue !== null
      ? currentMarketValue - previousMarketValue
      : null;

  const marketValueChangePct =
    currentMarketValue !== null &&
    previousMarketValue !== null &&
    previousMarketValue > 0
      ? Number(
          (
            ((currentMarketValue - previousMarketValue) / previousMarketValue) *
            100
          ).toFixed(1),
        )
      : null;

  const careerInjuries = player.injuries.length;

  const careerDaysInjured = player.injuries.reduce(
    (sum, injury) => sum + (injury.days ?? 0),
    0,
  );

  const careerGamesMissed = player.injuries.reduce(
    (sum, injury) => sum + (injury.gamesMissed ?? 0),
    0,
  );

  const seasonInjuries = player.injuries.filter(
    (injury) => injury.season === season,
  );

  const seasonDaysInjured = seasonInjuries.reduce(
    (sum, injury) => sum + (injury.days ?? 0),
    0,
  );

  const seasonGamesMissed = seasonInjuries.reduce(
    (sum, injury) => sum + (injury.gamesMissed ?? 0),
    0,
  );

  const marketValuePercentiles: MarketValuePercentiles = {
    worldwide: null,
    league: null,
    position: null,
  };

  if (currentMarketValue !== null) {
    const worldwidePlayers = await prisma.player.findMany({
      where: {
        marketValue: {
          not: null,
        },
      },
      select: {
        marketValue: true,
      },
    });

    const worldwideValues = worldwidePlayers
      .map((candidate) => candidate.marketValue)
      .filter((value): value is number => value !== null);

    marketValuePercentiles.worldwide = calculatePercentile(
      worldwideValues,
      currentMarketValue,
    );

    if (player.currentClub?.leagueId) {
      const leaguePlayers = await prisma.player.findMany({
        where: {
          marketValue: {
            not: null,
          },
          currentClub: {
            leagueId: player.currentClub.leagueId,
          },
        },
        select: {
          marketValue: true,
        },
      });

      const leagueValues = leaguePlayers
        .map((candidate) => candidate.marketValue)
        .filter((value): value is number => value !== null);

      marketValuePercentiles.league = calculatePercentile(
        leagueValues,
        currentMarketValue,
      );
    }

    if (player.position) {
      const positionPlayers = await prisma.player.findMany({
        where: {
          position: player.position,
          marketValue: {
            not: null,
          },
        },
        select: {
          marketValue: true,
        },
      });

      const positionValues = positionPlayers
        .map((candidate) => candidate.marketValue)
        .filter((value): value is number => value !== null);

      marketValuePercentiles.position = calculatePercentile(
        positionValues,
        currentMarketValue,
      );
    }
  }

  await prisma.playerMetric.upsert({
    where: {
      playerId,
    },

    update: {
      appearances,
      minutesPlayed,

      goals,
      assists,

      yellowCards,
      redCards,

      currentMarketValue,
      previousMarketValue,

      marketValueChange,
      marketValueChangePct,

      marketValuePercentileWorldwide: marketValuePercentiles.worldwide,
      marketValuePercentileLeague: marketValuePercentiles.league,
      marketValuePercentilePosition: marketValuePercentiles.position,

      careerInjuries,
      careerDaysInjured,
      careerGamesMissed,

      seasonDaysInjured,
      seasonGamesMissed,

      worldwideValueRank: player.worldwideRank,
      leagueValueRank: player.leagueRank,
      clubValueRank: player.clubRank,
      positionValueRank: player.positionRank,

      heightPercentileOverall: heightPercentiles.overall,
      heightPercentilePosition: heightPercentiles.position,

      clubMinutesRank: playingTimeRanks.club,
      leagueMinutesRank: playingTimeRanks.league,
      positionMinutesRank: playingTimeRanks.position,
    },

    create: {
      playerId,

      appearances,
      minutesPlayed,

      goals,
      assists,

      yellowCards,
      redCards,

      currentMarketValue,
      previousMarketValue,

      marketValueChange,
      marketValueChangePct,

      marketValuePercentileWorldwide: marketValuePercentiles.worldwide,
      marketValuePercentileLeague: marketValuePercentiles.league,
      marketValuePercentilePosition: marketValuePercentiles.position,

      careerInjuries,
      careerDaysInjured,
      careerGamesMissed,

      seasonDaysInjured,
      seasonGamesMissed,

      worldwideValueRank: player.worldwideRank,
      leagueValueRank: player.leagueRank,
      clubValueRank: player.clubRank,
      positionValueRank: player.positionRank,

      heightPercentileOverall: heightPercentiles.overall,
      heightPercentilePosition: heightPercentiles.position,

      clubMinutesRank: playingTimeRanks.club,
      leagueMinutesRank: playingTimeRanks.league,
      positionMinutesRank: playingTimeRanks.position,
    },
  });
}
