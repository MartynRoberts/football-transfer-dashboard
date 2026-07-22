import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const premierLeague = await prisma.league.upsert({
    where: {
      id: "premier-league",
    },
    update: {},
    create: {
      id: "premier-league",
      name: "Premier League",
      country: "England",
    },
  });

  const laLiga = await prisma.league.upsert({
    where: {
      id: "la-liga",
    },
    update: {},
    create: {
      id: "la-liga",
      name: "La Liga",
      country: "Spain",
    },
  });

  await prisma.club.createMany({
    data: [
      {
        id: "arsenal",
        name: "Arsenal",
        slug: "arsenal",
        leagueId: premierLeague.id,
      },
      {
        id: "liverpool",
        name: "Liverpool",
        slug: "liverpool",
        leagueId: premierLeague.id,
      },
      {
        id: "man-city",
        name: "Manchester City",
        slug: "manchester-city",
        leagueId: premierLeague.id,
      },
      {
        id: "real-madrid",
        name: "Real Madrid",
        slug: "real-madrid",
        leagueId: laLiga.id,
      },
    ],
    skipDuplicates: true,
  });

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
