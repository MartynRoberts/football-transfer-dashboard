import { prisma } from "../lib/prisma";

async function main() {
  const player = await prisma.player.findUnique({
    where: {
      id: "226049",
    },
    include: {
      marketValues: true,
      currentClub: true,
    },
  });

  console.log(JSON.stringify(player, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
