import { prisma } from "../lib/prisma";
import { fetchFromApi } from "../lib/sync/api";

interface PlayerStatsResponse {
  updatedAt: string;

  id: string;

  stats: Array<{
    competitionId: string;
    competitionName: string;

    season: string;

    clubId?: string;

    appearances?: number;
    goals?: number;
    assists?: number;

    yellowCards?: number;
    redCards?: number;

    minutesPlayed?: number;
  }>;
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function syncPlayerStats(playerId: string, transfermarktId: string) {
  const data = await fetchFromApi<PlayerStatsResponse>(
    `/players/${transfermarktId}/stats`,
  );

  if (!data?.stats?.length) {
    console.log(`No stats found`);

    return;
  }

  for (const stat of data.stats) {
    await prisma.playerStat.upsert({
      where: {
        playerId_competitionId_season: {
          playerId,

          competitionId: stat.competitionId,

          season: stat.season,
        },
      },

      update: {
        competitionName: stat.competitionName,

        clubId: stat.clubId ?? null,

        appearances: stat.appearances ?? 0,

        goals: stat.goals ?? 0,

        assists: stat.assists ?? 0,

        yellowCards: stat.yellowCards ?? 0,

        redCards: stat.redCards ?? 0,

        minutesPlayed: stat.minutesPlayed ?? 0,
      },

      create: {
        playerId,

        competitionId: stat.competitionId,

        competitionName: stat.competitionName,

        season: stat.season,

        clubId: stat.clubId ?? null,

        appearances: stat.appearances ?? 0,

        goals: stat.goals ?? 0,

        assists: stat.assists ?? 0,

        yellowCards: stat.yellowCards ?? 0,

        redCards: stat.redCards ?? 0,

        minutesPlayed: stat.minutesPlayed ?? 0,
      },
    });
  }
}

async function main() {
  console.log("📊 Starting player stats sync...");

  const players = await prisma.player.findMany({
    where: {
      transfermarktId: {
        not: null,
      },
    },

    select: {
      id: true,
      name: true,
      transfermarktId: true,
    },
  });

  console.log(`Found ${players.length} players`);

  let count = 0;

  for (const player of players) {
    count++;

    console.log(`[${count}/${players.length}] ${player.name}`);

    try {
      await syncPlayerStats(player.id, player.transfermarktId!);
    } catch (error) {
      console.error(`Failed syncing ${player.name}`, error);
    }

    await delay(250);
  }

  console.log("✅ Player stats sync complete");
}

main()
  .catch((error) => {
    console.error(error);

    process.exit(1);
  })

  .finally(async () => {
    await prisma.$disconnect();
  });
