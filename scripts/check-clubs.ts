// scripts/check-clubs.ts
import { prisma } from "../lib/prisma";

async function main() {
  const clubs = await prisma.club.findMany({
    take: 10,
    select: {
      name: true,
      leagueId: true,
    },
  });

  console.log(clubs);
}

main().finally(async () => {
  await prisma.$disconnect();
});
