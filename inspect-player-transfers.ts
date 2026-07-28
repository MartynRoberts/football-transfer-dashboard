import { prisma } from "./lib/prisma";

async function main() {
  const player = await prisma.player.findUnique({
    where: {
      id: "226049",
    },
    include: {
      transfers: {
        include: {
          fromClub: true,
          toClub: true,
        },
        orderBy: {
          transferDate: "asc",
        },
      },
    },
  });

  if (!player) {
    console.log("Player not found");
    return;
  }

  console.log(player.name);

  for (const t of player.transfers) {
    console.log({
      id: t.id,
      from: t.fromClub?.name,
      to: t.toClub?.name,
      date: t.transferDate,
      fee: t.fee,
      marketValue: t.marketValue,
      upcoming: t.upcoming,
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
