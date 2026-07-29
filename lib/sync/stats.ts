import { prisma } from "@/lib/prisma";
import { fetchFromApi } from "./api";

interface StatsResponse {
  stats: Array<{
    competitionId: string;
    competitionName: string;
    season: string;
    clubId: string;

    appearances: number;
    goals: number;
    assists: number;

    yellowCards: number;
    redCards: number;

    minutesPlayed: number;
  }>;
}

export async function syncPlayerStats(
  playerId: string,
  transfermarktId: string,
) {
  const data = await fetchFromApi<StatsResponse>(
    `/players/${transfermarktId}/stats`,
  );

  if (!data?.stats?.length) return;

  for (const stat of data.stats) {
    await prisma.playerStat.upsert({
      where: {
        id: `${playerId}-${stat.season}-${stat.competitionId}`,
      },

      update: {
        appearances: stat.appearances,
        goals: stat.goals,
        assists: stat.assists,
        yellowCards: stat.yellowCards,
        redCards: stat.redCards,
        minutesPlayed: stat.minutesPlayed,
      },

      create: {
        id: `${playerId}-${stat.season}-${stat.competitionId}`,

        playerId,

        season: stat.season,

        competitionId: stat.competitionId,
        competitionName: stat.competitionName,

        clubId: stat.clubId,

        appearances: stat.appearances,
        goals: stat.goals,
        assists: stat.assists,

        yellowCards: stat.yellowCards,
        redCards: stat.redCards,

        minutesPlayed: stat.minutesPlayed,
      },
    });
  }
}
