import { prisma } from "../lib/prisma";

async function main() {
  const player = await prisma.player.findFirst({
    include: {
      currentClub: true,
      marketValues: true,
      transfers: true,
    },
  });

  console.log(JSON.stringify(player, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
