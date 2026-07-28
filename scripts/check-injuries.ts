import { prisma } from "../lib/prisma";

async function main() {
  const injuries = await prisma.injury.findMany({
    include: {
      player: true,
    },
  });

  console.log(injuries);
}

main().finally(() => prisma.$disconnect());
