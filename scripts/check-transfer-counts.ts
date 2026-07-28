import { prisma } from "../lib/prisma";

async function main() {
  const players = await prisma.player.findMany({
    orderBy: {
      transfers: {
        _count: "desc",
      },
    },
    take: 20,
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          transfers: true,
        },
      },
    },
  });

  console.log(JSON.stringify(players, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
