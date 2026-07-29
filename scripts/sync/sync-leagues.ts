import { prisma } from "../../lib/prisma";
import slugify from "../../lib/sync/helpers/slugify";

const LEAGUES = [
  {
    id: "GB1",
    name: "Premier League",
    country: "England",
  },
  {
    id: "L1",
    name: "Bundesliga",
    country: "Germany",
  },
  {
    id: "ES1",
    name: "La Liga",
    country: "Spain",
  },
  {
    id: "IT1",
    name: "Serie A",
    country: "Italy",
  },
  {
    id: "FR1",
    name: "Ligue 1",
    country: "France",
  },
];

export async function syncLeagues() {
  console.log("🏆 Syncing leagues...");

  for (const league of LEAGUES) {
    await prisma.league.upsert({
      where: {
        transfermarktId: league.id,
      },

      update: {
        name: league.name,
        country: league.country,
      },

      create: {
        transfermarktId: league.id,
        name: league.name,
        country: league.country,
        slug: slugify(league.name),
      },
    });

    console.log(`✓ ${league.name}`);
  }

  console.log("✅ Leagues synced");
}

if (require.main === module) {
  syncLeagues().finally(() => prisma.$disconnect());
}
