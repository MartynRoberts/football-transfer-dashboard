import { prisma } from "@/lib/prisma";

interface HeightPercentiles {
  overall: number | null;
  position: number | null;
}

interface PlayingTimeRanks {
  club: number | null;
  clubTotal: number;

  league: number | null;
  leagueTotal: number;

  position: number | null;
  positionTotal: number;
}

interface InjuryMetrics {
  careerInjuries: number;
  careerGamesMissed: number;
  careerDaysInjured: number;

  seasonGamesMissed: number;
  seasonDaysInjured: number;

  seasonInjuryGamesPercentage: number | null;
  careerInjuryGamesPercentage: number | null;

  premierLeagueAvailabilityRank: number | null;
  premierLeagueAvailabilityRankTotal: number;

  topFiveAvailabilityRank: number | null;
  topFiveAvailabilityRankTotal: number;

  recurrentInjuryWarning: boolean;
  recurrentInjuryGroup: string | null;
  recurrentInjuryCount: number;
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
  injuryMetrics: InjuryMetrics,
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
            is: {
              leagueId: player.currentClub.leagueId,
            },
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

  const metricData = {
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

    worldwideValueRank: player.worldwideRank,
    leagueValueRank: player.leagueRank,
    clubValueRank: player.clubRank,
    positionValueRank: player.positionRank,

    heightPercentileOverall: heightPercentiles.overall,

    heightPercentilePosition: heightPercentiles.position,

    clubMinutesRank: playingTimeRanks.club,
    clubMinutesRankTotal: playingTimeRanks.clubTotal,

    leagueMinutesRank: playingTimeRanks.league,
    leagueMinutesRankTotal: playingTimeRanks.leagueTotal,

    positionMinutesRank: playingTimeRanks.position,

    positionMinutesRankTotal: playingTimeRanks.positionTotal,

    careerInjuries: injuryMetrics.careerInjuries,

    careerGamesMissed: injuryMetrics.careerGamesMissed,

    careerDaysInjured: injuryMetrics.careerDaysInjured,

    seasonGamesMissed: injuryMetrics.seasonGamesMissed,

    seasonDaysInjured: injuryMetrics.seasonDaysInjured,

    seasonInjuryGamesPercentage: injuryMetrics.seasonInjuryGamesPercentage,

    careerInjuryGamesPercentage: injuryMetrics.careerInjuryGamesPercentage,

    premierLeagueAvailabilityRank: injuryMetrics.premierLeagueAvailabilityRank,

    premierLeagueAvailabilityRankTotal:
      injuryMetrics.premierLeagueAvailabilityRankTotal,

    topFiveAvailabilityRank: injuryMetrics.topFiveAvailabilityRank,

    topFiveAvailabilityRankTotal: injuryMetrics.topFiveAvailabilityRankTotal,

    recurrentInjuryWarning: injuryMetrics.recurrentInjuryWarning,

    recurrentInjuryGroup: injuryMetrics.recurrentInjuryGroup,

    recurrentInjuryCount: injuryMetrics.recurrentInjuryCount,
  };

  await prisma.playerMetric.upsert({
    where: {
      playerId,
    },

    update: metricData,

    create: {
      playerId,
      ...metricData,
    },
  });
}
