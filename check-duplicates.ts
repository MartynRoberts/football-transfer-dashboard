import { prisma } from "./lib/prisma";

async function main() {
  const duplicates = await prisma.transfer.groupBy({
    by: ["playerId", "fromClubId", "toClubId", "transferDate", "fee"],
    _count: {
      id: true,
    },
    having: {
      id: {
        _count: {
          gt: 1,
        },
      },
    },
  });

  console.log(JSON.stringify(duplicates, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
