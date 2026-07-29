import { prisma } from "../lib/prisma";
import { getPositionGroup } from "../lib/sync/helpers/position-group";

async function main() {
  const players = await prisma.player.findMany({
    where: {
      position: {
        not: null,
      },
    },
  });

  console.log(`Updating ${players.length} players`);

  for (const player of players) {
    await prisma.player.update({
      where: {
        id: player.id,
      },
      data: {
        positionGroup: getPositionGroup(player.position),
      },
    });

    console.log(
      `✓ ${player.name}: ${player.position} → ${getPositionGroup(player.position)}`,
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
