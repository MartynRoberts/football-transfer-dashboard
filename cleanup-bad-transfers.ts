import { prisma } from "./lib/prisma";

async function main() {
  const result = await prisma.transfer.deleteMany({
    where: {
      fromClubId: null,
      toClubId: null,
    },
  });

  console.log(`Deleted ${result.count} bad transfers`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
