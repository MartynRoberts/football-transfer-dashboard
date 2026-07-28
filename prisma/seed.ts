import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const leagues = [
    {
      id: "premier-league",
      name: "Premier League",
      country: "England",
      slug: "premier-league",
      transfermarktId: "GB1",
    },
    {
      id: "bundesliga",
      name: "Bundesliga",
      country: "Germany",
      slug: "bundesliga",
      transfermarktId: "L1",
    },
    {
      id: "la-liga",
      name: "La Liga",
      country: "Spain",
      slug: "la-liga",
      transfermarktId: "ES1",
    },
    {
      id: "serie-a",
      name: "Serie A",
      country: "Italy",
      slug: "serie-a",
      transfermarktId: "IT1",
    },
    {
      id: "ligue-1",
      name: "Ligue 1",
      country: "France",
      slug: "ligue-1",
      transfermarktId: "FR1",
    },
  ];

  for (const league of leagues) {
    await prisma.league.upsert({
      where: {
        transfermarktId: league.transfermarktId,
      },
      update: {
        name: league.name,
        country: league.country,
        slug: league.slug,
      },
      create: league,
    });
  }

  await prisma.season.upsert({
    where: {
      id: "2025-26",
    },
    update: {},
    create: {
      id: "2025-26",
      name: "2025/26",
      startYear: 2025,
      endYear: 2026,
    },
  });

  console.log("Seed completed successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
