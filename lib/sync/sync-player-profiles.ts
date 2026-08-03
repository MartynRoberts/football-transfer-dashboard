import { prisma } from "../../lib/prisma";
import { syncPlayerProfile } from "../../lib/sync/players";

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(
  operation: () => Promise<T>,
  attempts = 4,
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

      const delay = 2000 * 2 ** (attempt - 1);

      console.warn(
        `Attempt ${attempt}/${attempts} failed; retrying in ${delay}ms`,
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

async function main() {
  const players = await prisma.player.findMany({
    where: {
      transfermarktId: {
        not: null,
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
  });

  let succeeded = 0;
  let failed = 0;

  for (const [index, player] of players.entries()) {
    const progress = `[${index + 1}/${players.length}]`;

    if (!player.transfermarktId) {
      continue;
    }

    try {
      console.log(`${progress} Syncing ${player.name}`);

      await withRetry(() =>
        syncPlayerProfile(player.id, player.transfermarktId!),
      );

      succeeded++;
      console.log(`${progress} ✓ ${player.name}`);
    } catch (error) {
      failed++;
      console.error(`${progress} ✗ ${player.name}`, error);
    }

    // Reduce pressure on the API.
    await sleep(250);
  }

  console.log(`Profiles complete: ${succeeded} succeeded, ${failed} failed`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Fatal profile sync error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
