import { prisma } from "@/lib/prisma";

const API_URL = process.env.TRANSFERMARKT_API_URL;

export async function syncPlayers() {
  const startedAt = new Date();

  const syncLog = await prisma.syncLog.create({
    data: {
      type: "players",
      status: "running",
      startedAt,
    },
  });

  try {
    if (!API_URL) {
      throw new Error("TRANSFERMARKT_API_URL is not configured");
    }

    const clubs = await prisma.club.findMany({
      where: {
        transfermarktId: {
          not: null,
        },
      },
    });

    let created = 0;
    let updated = 0;

    for (const club of clubs) {
      const response = await fetch(
        `${API_URL}/clubs/${club.transfermarktId}/players`,
      );

      if (!response.ok) {
        throw new Error(`Failed fetching players for ${club.name}`);
      }

      const data = await response.json();

      for (const player of data.players ?? []) {
        const existing = await prisma.player.findUnique({
          where: {
            transfermarktId: player.id,
          },
        });

        await prisma.player.upsert({
          where: {
            id: existing?.id ?? player.id,
          },
          update: {
            name: player.name,
            position: player.position,
            nationality: Array.isArray(player.nationality)
              ? player.nationality.join(", ")
              : player.nationality,
            currentClubId: club.id,
          },
          create: {
            id: player.id,
            transfermarktId: player.id,
            name: player.name,
            position: player.position,
            nationality: Array.isArray(player.nationality)
              ? player.nationality.join(", ")
              : player.nationality,
            currentClubId: club.id,
          },
        });

        if (existing) {
          updated++;
        } else {
          created++;
        }
      }
    }

    await prisma.syncLog.update({
      where: {
        id: syncLog.id,
      },
      data: {
        status: "completed",
        recordsCreated: created,
        recordsUpdated: updated,
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      created,
      updated,
    };
  } catch (error) {
    await prisma.syncLog.update({
      where: {
        id: syncLog.id,
      },
      data: {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      },
    });

    throw error;
  }
}
