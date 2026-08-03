import "server-only";

import { prisma } from "@/lib/prisma";
import {
  buildSeasonPerformances,
  getUniqueStatScopes,
} from "@/lib/players/player-statistics";
import { playerPageInclude, type PlayerPageData } from "@/lib/players/types";

export async function getPlayerPageData(
  slug: string,
): Promise<PlayerPageData | null> {
  const player = await prisma.player.findUnique({
    where: { slug },
    include: playerPageInclude,
  });

  if (!player) {
    return null;
  }

  const secondaryPositions = Array.isArray(player.secondaryPositions)
    ? player.secondaryPositions.filter(
        (position): position is string => typeof position === "string",
      )
    : typeof player.secondaryPositions === "string"
      ? [player.secondaryPositions]
      : [];

  const marketValueChartData = player.marketValueHistories
    .slice()
    .sort((first, second) => first.date.getTime() - second.date.getTime())
    .map((history) => ({
      date: history.date.toISOString(),
      marketValue: history.marketValue,
      clubName: history.clubName,
    }));

  const currentClubStats = player.currentClub?.transfermarktId
    ? player.stats.filter(
        (stat) => stat.clubId === player.currentClub?.transfermarktId,
      )
    : [];
  const scopes = getUniqueStatScopes(currentClubStats);
  const teamStats =
    scopes.length > 0
      ? await prisma.playerStat.findMany({
          where: { OR: scopes },
          select: {
            season: true,
            clubId: true,
            competitionId: true,
            goals: true,
          },
        })
      : [];

  return {
    player,
    secondaryPositions,
    marketValueChartData,
    seasonPerformances: buildSeasonPerformances(currentClubStats, teamStats),
  };
}
