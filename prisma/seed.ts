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

  const players = [
    {
      id: "bukayo-saka",
      transfermarktId: "433177",
      name: "Bukayo Saka",
      position: "Right Winger",
      nationality: "England",
      currentClubId: "arsenal",
    },
    {
      id: "martin-odegaard",
      transfermarktId: "316641",
      name: "Martin Ødegaard",
      position: "Attacking Midfielder",
      nationality: "Norway",
      currentClubId: "arsenal",
    },
    {
      id: "mohamed-salah",
      transfermarktId: "148455",
      name: "Mohamed Salah",
      position: "Right Winger",
      nationality: "Egypt",
      currentClubId: "liverpool",
    },
    {
      id: "erling-haaland",
      transfermarktId: "418560",
      name: "Erling Haaland",
      position: "Striker",
      nationality: "Norway",
      currentClubId: "man-city",
    },
    {
      id: "vinicius-jr",
      transfermarktId: "371998",
      name: "Vinicius Junior",
      position: "Left Winger",
      nationality: "Brazil",
      currentClubId: "real-madrid",
    },
  ];

  for (const player of players) {
    await prisma.player.upsert({
      where: {
        id: player.id,
      },
      update: {
        transfermarktId: player.transfermarktId,
        name: player.name,
        position: player.position,
        nationality: player.nationality,
        currentClubId: player.currentClubId,
      },
      create: player,
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
      recordsCreated: 7,
      recordsUpdated: 0,
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
