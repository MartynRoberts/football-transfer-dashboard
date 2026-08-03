import { prisma } from "../../lib/prisma";
import { syncPlayerMarketValue } from "../../lib/sync/market-values";
import { TOP_FIVE_LEAGUE_IDS } from "../../lib/sync/scope";

function getLimit(): number | undefined {
  const argument = process.argv.find((value) => value.startsWith("--limit="));
  const limit = argument
    ? Number.parseInt(argument.split("=")[1], 10)
    : Number.NaN;

  return Number.isFinite(limit) && limit > 0 ? limit : undefined;
}

async function main() {
  const limit = getLimit();

  const players = await prisma.player.findMany({
    where: {
      transfermarktId: {
        not: null,
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

    try {
      console.log(`${progress} Syncing market values for ${player.name}`);
      const synced = await syncPlayerMarketValue(
        player.id,
        player.transfermarktId!,
      );

      if (synced) {
        succeeded++;
      } else {
        failed++;
        console.warn(
          `${progress} No valid market-value data for ${player.name}`,
        );
      }
    } catch (error) {
      failed++;
      console.error(`${progress} Failed ${player.name}`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  console.log(
    `Market values complete: ${succeeded} succeeded, ${failed} failed`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Fatal market-value sync error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
