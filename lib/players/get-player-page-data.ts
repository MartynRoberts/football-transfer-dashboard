import "server-only";

import { prisma } from "@/lib/prisma";
import {
  buildSeasonPerformances,
  getUniqueStatScopes,
  type ComparisonPlayerPerformance,
} from "@/lib/players/player-statistics";
import { playerPageInclude, type PlayerPageData } from "@/lib/players/types";
import { TOP_FIVE_LEAGUE_IDS } from "@/lib/sync/scope";

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

  const currentClubTransfermarktId =
    player.currentClub?.transfermarktId ?? null;

  const currentClubStats = currentClubTransfermarktId
    ? player.stats.filter((stat) => stat.clubId === currentClubTransfermarktId)
    : [];

  const scopes = getUniqueStatScopes(currentClubStats);

  const teamStats =
    scopes.length > 0
      ? await prisma.playerStat.findMany({
          where: {
            OR: scopes,
          },
          select: {
            season: true,
            clubId: true,
            competitionId: true,
            goals: true,
          },
        })
      : [];

  const relevantSeasons = Array.from(
    new Set(currentClubStats.map((stat) => stat.season)),
  );

  const comparisonPlayers =
    player.position && relevantSeasons.length > 0
      ? await prisma.player.findMany({
          where: {
            position: player.position,

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
            position: true,

            currentClub: {
              select: {
                transfermarktId: true,
                leagueId: true,
              },
            },

            stats: {
              where: {
                season: {
                  in: relevantSeasons,
                },
              },

              select: {
                season: true,
                clubId: true,
                minutesPlayed: true,
                goals: true,
                assists: true,
              },
            },
          },
        })
      : [];

  const comparisonPerformances: ComparisonPlayerPerformance[] =
    comparisonPlayers.flatMap((comparisonPlayer) => {
      const comparisonClubTransfermarktId =
        comparisonPlayer.currentClub?.transfermarktId ?? null;

      if (!comparisonClubTransfermarktId) {
        return [];
      }

      const comparisonCurrentClubStats = comparisonPlayer.stats.filter(
        (stat) => stat.clubId === comparisonClubTransfermarktId,
      );

      const totalsBySeason = comparisonCurrentClubStats.reduce<
        Record<string, ComparisonPlayerPerformance>
      >((seasons, stat) => {
        const existing = seasons[stat.season] ?? {
          playerId: comparisonPlayer.id,
          leagueId: comparisonPlayer.currentClub?.leagueId ?? null,
          position: comparisonPlayer.position,
          season: stat.season,
          minutesPlayed: 0,
          goals: 0,
          assists: 0,
        };

        existing.minutesPlayed += stat.minutesPlayed;
        existing.goals += stat.goals;
        existing.assists += stat.assists;

        seasons[stat.season] = existing;

        return seasons;
      }, {});

      return Object.values(totalsBySeason);
    });

  const seasonPerformances = buildSeasonPerformances(
    currentClubStats,
    teamStats,
    {
      playerId: player.id,
      playerPosition: player.position,
      playerLeagueId: player.currentClub?.leagueId ?? null,
      comparisonPerformances,
    },
  );

  return {
    player,
    secondaryPositions,
    marketValueChartData,
    seasonPerformances,
  };
}
