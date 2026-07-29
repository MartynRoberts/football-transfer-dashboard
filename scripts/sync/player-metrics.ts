import { prisma } from "@/lib/prisma";

export async function syncPlayerMetrics(playerId: string) {
  const player = await prisma.player.findUnique({
    where: {
      id: playerId,
    },

    include: {
      stats: true,
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
    player.marketValueHistories[0]?.marketValue ?? null;

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

      careerInjuries,
      careerDaysInjured,
      careerGamesMissed,
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

      careerInjuries,
      careerDaysInjured,
      careerGamesMissed,
    },
  });
}
