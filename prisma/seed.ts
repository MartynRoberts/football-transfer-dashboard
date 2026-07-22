import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.league.createMany({
    data: [
      {
        id: "premier-league",
        name: "Premier League",
      },
      {
        id: "la-liga",
        name: "La Liga",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.club.createMany({
    data: [
      {
        id: "arsenal",
        name: "Arsenal",
        slug: "arsenal",
        leagueId: "premier-league",
      },
      {
        id: "liverpool",
        name: "Liverpool",
        slug: "liverpool",
        leagueId: "premier-league",
      },
      {
        id: "man-city",
        name: "Manchester City",
        slug: "manchester-city",
        leagueId: "premier-league",
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
