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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
