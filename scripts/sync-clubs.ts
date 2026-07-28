import { prisma } from "../lib/prisma";
import { fetchFromApi } from "../lib/sync/api";
import slugify from "../lib/sync/helpers/slugify";

interface LeagueClubsResponse {
  id: string;
  name: string;
  clubs: Array<{
    id: string;
    name: string;
    logoUrl?: string;
  }>;
}

const TARGET_LEAGUES = [
  {
    transfermarktId: "GB1",
    name: "Premier League",
  },
  {
    transfermarktId: "L1",
    name: "Bundesliga",
  },
  {
    transfermarktId: "ES1",
    name: "La Liga",
  },
  {
    transfermarktId: "IT1",
    name: "Serie A",
  },
  {
    transfermarktId: "FR1",
    name: "Ligue 1",
  },
];

async function syncLeagueClubs(
  leagueId: string,
  transfermarktLeagueId: string,
) {
  console.log(
    `\nFetching clubs for league Transfermarkt ID: ${transfermarktLeagueId}`,
  );

  const data = await fetchFromApi<LeagueClubsResponse>(
    `/competitions/${transfermarktLeagueId}/clubs`,
  );

  if (!data?.clubs?.length) {
    console.warn(`⚠️ No clubs returned for league ${transfermarktLeagueId}`);
    return;
  }

  console.log(`Found ${data.clubs.length} clubs`);

  for (const club of data.clubs) {
    await prisma.club.upsert({
      where: {
        transfermarktId: club.id,
      },

      update: {
        name: club.name,
        leagueId,
        ...(club.logoUrl && {
          logoUrl: club.logoUrl,
        }),
      },

      create: {
        id: `tm-${club.id}`,
        transfermarktId: club.id,
        name: club.name,
        slug: `${slugify(club.name)}-${club.id}`,
        logoUrl: club.logoUrl ?? null,
        leagueId,
      },
    });

    console.log(`  ✓ ${club.name}`);
  }
}

async function main() {
  console.log("🚀 Starting club sync...\n");

  for (const targetLeague of TARGET_LEAGUES) {
    const league = await prisma.league.findUnique({
      where: {
        transfermarktId: targetLeague.transfermarktId,
      },
    });

    if (!league) {
      console.warn(`⚠️ League missing in database: ${targetLeague.name}`);
      continue;
    }

    await syncLeagueClubs(league.id, targetLeague.transfermarktId);
  }

  console.log("\n✅ Club sync complete");
}

main()
  .catch((error) => {
    console.error("❌ Club sync failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
