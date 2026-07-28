import { prisma } from "../lib/prisma";

async function main() {
  const leagues = await prisma.league.findMany();

  console.log(leagues);
}

main().finally(async () => {
  await prisma.$disconnect();
});
