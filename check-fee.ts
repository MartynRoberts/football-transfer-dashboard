import { prisma } from "./lib/prisma";

async function main() {
  const transfer = await prisma.transfer.findUnique({
    where: {
      id: "2340936",
    },
  });

  console.log(transfer);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());