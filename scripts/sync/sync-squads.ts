import { prisma } from "../../lib/prisma";
import { fetchFromApi } from "../../lib/sync/api";
import slugify from "../../lib/sync/helpers/slugify";
import { getPositionGroup } from "../../lib/sync/helpers/position-group";

interface SquadResponse {
  id: string;

  name: string;

  players: Array<{
    id: string;

    name: string;

    position?: string;
  }>;
}

export async function syncSquads() {
  console.log("👥 Syncing squads...");

  const clubs = await prisma.club.findMany({
    where: {
      transfermarktId: {
        not: null,
      },
    },

    include: {
      league: true,
    },
  });

  for (const club of clubs) {
    console.log(`\n${club.name}`);

    const data = await fetchFromApi<SquadResponse>(
      `/clubs/${club.transfermarktId}/players`,
    );

    if (!data?.players) {
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

          positionGroup: getPositionGroup(p.position),

          currentClubId: club.id,
        },

        create: {
          id: p.id,

          transfermarktId: p.id,

          name: p.name,

          slug: `${slugify(p.name)}-${p.id}`,

          position: p.position,

          positionGroup: getPositionGroup(p.position),

          currentClubId: club.id,
        },
      });

      console.log(`✓ ${p.name}`);
    }

    await new Promise((r) => setTimeout(r, 250));
  }

  console.log("\n✅ Squads synced");
}

if (require.main === module) {
  syncSquads().finally(() => prisma.$disconnect());
}
