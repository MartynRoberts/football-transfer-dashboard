import { prisma } from "@/lib/prisma";
import slugify from "./helpers/slugify";
import { fetchFromApi } from "./api";
import { PlayerProfileResponse, TransfermarktPlayer } from "./types";

export async function syncPlayerProfile(playerId: string, tmPlayerId: string) {
  const data = await fetchFromApi<PlayerProfileResponse>(
    `/players/${tmPlayerId}/profile`,
  );

  if (!data) return false;

  let currentClubId: string | null = null;

  // Current club
  if (data.club?.id) {
    const club = await prisma.club.upsert({
      where: {
        transfermarktId: data.club.id,
      },
      update: {
        name: data.club.name,
      },
      create: {
        id: `tm-${data.club.id}`,
        transfermarktId: data.club.id,
        name: data.club.name,
        slug: `${data.club.name
          .toLowerCase()
          .replace(/\s+/g, "-")}-${data.club.id}`,
      },
    });

    currentClubId = club.id;
  }

  // Update player
  await prisma.player.update({
    where: {
      id: playerId,
    },
    data: {
      imageUrl: data.imageUrl ?? null,
      nationality: data.citizenship?.join(", ") ?? null,
      height: data.height ?? null,
      foot: data.foot ?? null,

      position: data.position?.main ?? undefined,

      currentClubId,

      joinedOn: data.club?.joined ? new Date(data.club.joined) : null,

      contract: data.club?.contractExpires
        ? new Date(data.club.contractExpires)
        : null,
    },
  });

  // Market value history
  if (data.marketValue) {
    await prisma.marketValue.create({
      data: {
        playerId,
        value: data.marketValue,
        capturedAt: new Date(),
      },
    });
  }

  return true;
}

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
    let failed = 0;

    for (const club of clubs) {
      const response = await fetch(
        `${API_URL}/clubs/${club.transfermarktId}/players`,
      );

      if (!response.ok) {
        throw new Error(`Failed fetching players for ${club.name}`);
      }

      const data = await response.json();

      for (const player of (data.players ?? []) as TransfermarktPlayer[]) {
        const existing = await prisma.player.findUnique({
          where: {
            transfermarktId: player.id,
          },
        });

        const playerSlug = `${slugify(player.name)}-${player.id}`;

        // Helper to safely format nationality into a single string or null
        const formattedNationality = Array.isArray(player.nationality)
          ? player.nationality.join(", ")
          : (player.nationality ?? null);

        await prisma.player.upsert({
          where: {
            transfermarktId: player.id,
          },
          update: {
            name: player.name,
            position: player.position,
            nationality: formattedNationality,
            foot: player.foot ?? null,
            height: player.height ?? null,
            contract: player.contract ? new Date(player.contract) : null,
            joinedOn: player.joinedOn ? new Date(player.joinedOn) : null,
            currentClubId: club.id,
          },
          create: {
            id: player.id,
            transfermarktId: player.id,
            name: player.name,
            slug: playerSlug,
            position: player.position,
            nationality: formattedNationality,
            foot: player.foot ?? null,
            height: player.height ?? null,
            contract: player.contract ? new Date(player.contract) : null,
            joinedOn: player.joinedOn ? new Date(player.joinedOn) : null,
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
        errorMessage:
          failed > 0 ? `${failed} players failed during sync` : null,
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
