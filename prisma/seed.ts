import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const premierLeague = await prisma.league.upsert({
    where: {
      id: "premier-league",
    },
    update: {
      transfermarktId: "GB1",
    },
    create: {
      id: "premier-league",
      name: "Premier League",
      country: "England",
      transfermarktId: "GB1",
    },
  });

  const laLiga = await prisma.league.upsert({
    where: {
      id: "la-liga",
    },
    update: {
      transfermarktId: "ES1",
    },
    create: {
      id: "la-liga",
      name: "La Liga",
      country: "Spain",
      transfermarktId: "ES1",
    },
  });

  const clubs = [
    {
      id: "arsenal",
      name: "Arsenal",
      slug: "arsenal",
      leagueId: premierLeague.id,
      transfermarktId: "11",
    },
    {
      id: "liverpool",
      name: "Liverpool",
      slug: "liverpool",
      leagueId: premierLeague.id,
      transfermarktId: "12",
    },
    {
      id: "man-city",
      name: "Manchester City",
      slug: "manchester-city",
      leagueId: premierLeague.id,
      transfermarktId: "13",
    },
    {
      id: "real-madrid",
      name: "Real Madrid",
      slug: "real-madrid",
      leagueId: laLiga.id,
      transfermarktId: "14",
    },
  ];

  for (const club of clubs) {
    await prisma.club.upsert({
      where: {
        id: club.id,
      },
      update: {
        name: club.name,
        slug: club.slug,
        leagueId: club.leagueId,
        transfermarktId: club.transfermarktId,
      },
      create: club,
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

  await prisma.syncLog.create({
    data: {
      type: "seed",
      status: "completed",
      records: 7,
      completedAt: new Date(),
    },
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
