import { prisma } from "../../lib/prisma";
import { fetchFromApi } from "../../lib/sync/api";
import slugify from "../../lib/sync/helpers/slugify";
import { TOP_FIVE_LEAGUE_IDS } from "../../lib/sync/scope";

interface LeagueClubsResponse {
  id: string;
  name: string;
  clubs: Array<{
    id: string;
    name: string;
  }>;
}

export async function syncClubs() {
  console.log("🏟 Syncing clubs...");

  const leagues = await prisma.league.findMany({
    where: {
      transfermarktId: {
        in: [...TOP_FIVE_LEAGUE_IDS],
      },
    },
  });

  for (const league of leagues) {
    if (!league.transfermarktId) {
      continue;
    }

    const data = await fetchFromApi<LeagueClubsResponse>(
      `/competitions/${league.transfermarktId}/clubs`,
    );

    if (!data?.clubs) {
      console.warn(`No clubs found for ${league.name}`);
      continue;
    }

    console.log(`\n${league.name}: ${data.clubs.length} clubs`);

    for (const club of data.clubs) {
      await prisma.club.upsert({
        where: {
          transfermarktId: club.id,
        },
        update: {
          name: club.name,
          slug: `${slugify(club.name)}-${club.id}`,
          leagueId: league.id,
        },
        create: {
          id: `tm-${club.id}`,
          transfermarktId: club.id,
          name: club.name,
          slug: `${slugify(club.name)}-${club.id}`,
          leagueId: league.id,
        },
      });

      console.log(`✓ ${club.name}`);
    }
  }

  console.log("\n✅ Clubs synced");
}

syncClubs()
  .catch((error) => {
    console.error("Club sync failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
