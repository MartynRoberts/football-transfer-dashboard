import { prisma } from "./lib/prisma";

async function main() {
  const count = await prisma.transfer.count();
  console.log(count);
}

main()
  .finally(() => prisma.$disconnect());