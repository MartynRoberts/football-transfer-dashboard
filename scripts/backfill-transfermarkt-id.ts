import { prisma } from "../lib/prisma";

async function main() {
  const transfers = await prisma.transfer.findMany({
    select: {
      id: true,
      transfermarktId: true,
    },
  });

  let updated = 0;

  for (const transfer of transfers) {
    if (!transfer.transfermarktId) {
      await prisma.transfer.update({
        where: {
          id: transfer.id,
        },
        data: {
          transfermarktId: transfer.id,
        },
      });

      updated++;
    }
  }

  console.log(`Updated ${updated} transfers`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
