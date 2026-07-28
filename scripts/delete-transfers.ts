import { prisma } from "../lib/prisma";

async function main() {
  const result = await prisma.transfer.deleteMany({});

  console.log(`Deleted ${result.count} transfers`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
