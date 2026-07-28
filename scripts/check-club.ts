import { prisma } from "../lib/prisma";

async function main() {
  const club = await prisma.club.findFirst();
  console.log(club);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
