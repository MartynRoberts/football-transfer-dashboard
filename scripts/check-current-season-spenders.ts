import { prisma } from "../lib/prisma";

async function main() {
  const rows = await prisma.transfer.groupBy({
    by: ["toClubId"],

    where: {
      season: "26/27",

      toClubId: {
        not: null,
      },

      fee: {
        not: null,
        gt: 0,
      },
    },

    _sum: {
      fee: true,
    },

    _count: {
      id: true,
    },

    orderBy: {
      _sum: {
        fee: "desc",
      },
    },

    take: 10,
  });

  console.table(rows);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
