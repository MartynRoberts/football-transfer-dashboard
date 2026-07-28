import { prisma } from "../lib/prisma";

async function main() {
  const transfer = await prisma.transfer.findFirst();

  console.log(transfer);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
