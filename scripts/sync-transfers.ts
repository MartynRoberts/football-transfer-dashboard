import { prisma } from "../lib/prisma";
import { syncPlayerTransfers } from "../lib/sync/transfers";

async function main() {
  console.log("🚀 Starting Transfermarkt Sync Job...\n");

  // Fetch only players that have a valid transfermarktId
  const players = await prisma.player.findMany({
    where: {
      transfermarktId: {
        not: null,
      },
    },
    select: { id: true, name: true, transfermarktId: true },
  });

  if (players.length === 0) {
    console.log(
      "⚠️ No eligible players with Transfermarkt IDs found in database.",
    );
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const player of players) {
    // Guard check for TypeScript strict null checking
    if (!player.transfermarktId) {
      console.warn(`  ⚠️ Skipping ${player.name} (Missing Transfermarkt ID)`);
      failCount++;
      continue;
    }

    console.log(
      `Syncing transfers for ${player.name} (TM ID: ${player.transfermarktId})...`,
    );

    try {
      const ok = await syncPlayerTransfers(player.id, player.transfermarktId);
      if (ok) {
        successCount++;
        console.log(`  ✓ Successfully synced ${player.name}`);
      } else {
        failCount++;
        console.warn(
          `  ⚠️ Failed or no transfer data returned for ${player.name}`,
        );
      }
    } catch (err) {
      failCount++;
      console.error(`  ❌ Error syncing ${player.name}:`, err);
    }
  }

  console.log("\n=================================");
  console.log(`Sync finished!`);
  console.log(`Successes: ${successCount}`);
  console.log(`Failures:  ${failCount}`);
  console.log("=================================");
}

main()
  .catch((e) => {
    console.error("Fatal error during sync process:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
