import { prisma } from "../lib/prisma";
import { syncPlayerMetrics } from "../lib/sync/player-metrics";

async function main() {
  console.log("📊 Building player metrics...");

  const players = await prisma.player.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  let count = 0;

  for (const player of players) {
    count++;

    console.log(`[${count}/${players.length}] ${player.name}`);

    await syncPlayerMetrics(player.id);
  }

  console.log("✅ Metrics complete");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
