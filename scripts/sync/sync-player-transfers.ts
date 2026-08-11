import { prisma } from "../../lib/prisma";
import { syncPlayerTransfers } from "../../lib/sync/transfers";
import { TOP_FIVE_LEAGUE_IDS } from "../../lib/sync/scope";

function getLimit(): number | undefined {
  const argument = process.argv.find((value) => value.startsWith("--limit="));

  if (!argument) {
    return undefined;
  }

  const limit = Number.parseInt(argument.split("=")[1], 10);

  return Number.isFinite(limit) && limit > 0 ? limit : undefined;
}

function getPlayerTransfermarktId(): string | undefined {
  const argument = process.argv.find((value) => value.startsWith("--player="));
  const playerId = argument?.split("=")[1]?.trim();

  return playerId || undefined;
}

async function main() {
  const limit = getLimit();
  const playerTransfermarktId = getPlayerTransfermarktId();

  console.log(
    playerTransfermarktId
      ? `🔄 Syncing transfers for Transfermarkt player ${playerTransfermarktId}...`
      : "🔄 Syncing player transfers...",
  );

  const players = await prisma.player.findMany({
    where: {
      transfermarktId: {
        ...(playerTransfermarktId
          ? { equals: playerTransfermarktId }
          : { not: null }),
      },
      currentClub: {
        is: {
          league: {
            is: {
              transfermarktId: {
                in: [...TOP_FIVE_LEAGUE_IDS],
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      transfermarktId: true,
    },
    orderBy: {
      name: "asc",
    },
    ...(limit ? { take: limit } : {}),
  });

  let succeeded = 0;
  let failed = 0;

  for (const [index, player] of players.entries()) {
    const progress = `[${index + 1}/${players.length}]`;

    if (!player.transfermarktId) {
      failed++;
      console.warn(`${progress} Skipping ${player.name}: no TM ID`);
      continue;
    }

    console.log(`${progress} Syncing ${player.name}`);

    try {
      const synced = await withRetry(
        () => syncPlayerTransfers(player.id, player.transfermarktId!),
        3,
        2000,
      );

      if (synced) {
        succeeded++;
        console.log(`${progress} ✓ ${player.name}`);
      } else {
        failed++;
        console.warn(`${progress} No transfer data for ${player.name}`);
      }
    } catch (error) {
      failed++;
      console.error(`${progress} ✗ ${player.name}`, error);
    }
  }

  console.log("");
  console.log("✅ Transfer sync complete");
  console.log(`Successful: ${succeeded}`);
  console.log(`Failed:     ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Fatal transfer sync error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

async function withRetry<T>(
  operation: () => Promise<T>,
  attempts = 4,
  initialDelayMs = 2000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === attempts) {
        break;
      }

      const delay = initialDelayMs * Math.pow(2, attempt - 1);

      console.warn(
        `Attempt ${attempt}/${attempts} failed. Retrying in ${delay}ms...`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
