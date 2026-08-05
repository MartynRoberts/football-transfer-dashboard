import { prisma } from "../../lib/prisma";
import { fetchFromApi } from "../../lib/sync/api";
import slugify from "../../lib/sync/helpers/slugify";
import { getPositionGroup } from "../../lib/sync/helpers/position-group";
import { CURRENT_SEASON, TOP_FIVE_LEAGUE_IDS } from "../../lib/sync/scope";

interface SquadResponse {
  id: string;

  name: string;

  players: Array<{
    id: string;

    name: string;

    position?: string;

    dateOfBirth?: string;
  }>;
}

function parseDate(value?: string): Date | null {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export async function syncSquads() {
  console.log("👥 Syncing squads...");

  const force = process.argv.includes("--force");

  if (force) {
    console.log("⚠️ Force mode enabled: refreshing all eligible squads");
  }

  const clubs = await prisma.club.findMany({
    where: {
      transfermarktId: {
        not: null,
      },
      league: {
        is: {
          transfermarktId: {
            in: [...TOP_FIVE_LEAGUE_IDS],
          },
        },
      },
    },

    include: {
      league: true,
    },
  });

  for (const club of clubs) {
    console.log(`\n${club.name}`);

    try {
      const squadSync = await prisma.syncState.findFirst({
        where: {
          entityType: "CLUB",
          entityId: club.transfermarktId!,
          syncType: "SQUAD",
          season: CURRENT_SEASON,
        },
      });

      if (squadSync && !force) {
        console.log(
          `⏭ Skipping ${club.name} (${CURRENT_SEASON} squad already synced)`,
        );

        continue;
      }

      const data = await fetchFromApi<SquadResponse>(
        `/clubs/${club.transfermarktId}/players`,
      );

      if (!data?.players?.length) {
        console.warn(`⚠️ No squad data for ${club.name}`);
        continue;
      }

      for (const p of data.players) {
        await prisma.player.upsert({
          where: {
            transfermarktId: p.id,
          },

          update: {
            name: p.name,

            position: p.position,

            dateOfBirth: p.dateOfBirth ? parseDate(p.dateOfBirth) : undefined,

            positionGroup: getPositionGroup(p.position),

            currentClubId: club.id,
          },

          create: {
            id: p.id,

            transfermarktId: p.id,

            name: p.name,

            slug: `${slugify(p.name)}-${p.id}`,

            position: p.position,

            dateOfBirth: parseDate(p.dateOfBirth),

            positionGroup: getPositionGroup(p.position),

            currentClubId: club.id,
          },
        });

        console.log(`✓ ${p.name}`);
      }

      await prisma.syncState.upsert({
        where: {
          entityType_entityId_syncType_season: {
            entityType: "CLUB",
            entityId: club.transfermarktId!,
            syncType: "SQUAD",
            season: CURRENT_SEASON,
          },
        },
        update: {
          syncedAt: new Date(),
        },
        create: {
          entityType: "CLUB",
          entityId: club.transfermarktId!,
          syncType: "SQUAD",
          season: CURRENT_SEASON,
        },
      });
    } catch (error) {
      console.error(`❌ Failed squad sync for ${club.name}`);

      console.error(error);
    }

    await new Promise((r) => setTimeout(r, 250));
  }

  console.log("\n✅ Squads synced");
}

if (require.main === module) {
  syncSquads().finally(() => prisma.$disconnect());
}
