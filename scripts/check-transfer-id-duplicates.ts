import { prisma } from "../lib/prisma";

async function main() {
  const duplicates = await prisma.$queryRaw`
    SELECT id, COUNT(*) 
    FROM "Transfer"
    GROUP BY id
    HAVING COUNT(*) > 1;
  `;

  console.log(duplicates);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
