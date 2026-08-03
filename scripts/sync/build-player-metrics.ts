import { prisma } from "../../lib/prisma";
import { syncPlayerMetrics } from "../../scripts/sync/player-metrics";
import { TOP_FIVE_LEAGUE_IDS } from "../../lib/sync/scope";
import { CURRENT_SEASON } from "../../lib/sync/scope";

function getSeasonArgument(): string {
  const argument = process.argv.find((value) => value.startsWith("--season="));

  return argument?.split("=")[1]?.trim() || CURRENT_SEASON;
}

async function main() {
  const season = getSeasonArgument();

  console.log(`📊 Building player metrics for ${season}...`);

  const players = await prisma.player.findMany({
    where: {
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
      height: true,
      position: true,
      currentClubId: true,
      currentClub: {
        select: {
          leagueId: true,
        },
      },
      stats: {
        where: {
          season,
        },
        select: {
          minutesPlayed: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  let succeeded = 0;
  let failed = 0;

  const playersWithHeight = players.filter(
    (player): player is typeof player & { height: number } =>
      player.height !== null,
  );

  function percentile(height: number | null, comparisonHeights: number[]) {
    if (height === null || comparisonHeights.length <= 1) {
      return null;
    }

    const shorterPlayers = comparisonHeights.filter(
      (comparisonHeight) => comparisonHeight < height,
    ).length;

    return Math.round((shorterPlayers / (comparisonHeights.length - 1)) * 100);
  }

  const overallHeights = playersWithHeight.map((player) => player.height);

  const playersWithMinutes = players.map((player) => ({
    ...player,
    minutesPlayed: player.stats.reduce(
      (total, stat) => total + stat.minutesPlayed,
      0,
    ),
  }));

  function minutesRank(
    minutesPlayed: number,
    comparisonMinutes: number[],
  ): number | null {
    if (comparisonMinutes.length === 0) {
      return null;
    }

    return (
      1 +
      comparisonMinutes.filter(
        (comparisonValue) => comparisonValue > minutesPlayed,
      ).length
    );
  }

  for (const [index, player] of players.entries()) {
    const progress = `[${index + 1}/${players.length}]`;

    console.log(`${progress} Building metrics for ${player.name}`);

    try {
      const positionHeights = player.position
        ? playersWithHeight
            .filter(
              (comparisonPlayer) =>
                comparisonPlayer.position?.toLowerCase() ===
                player.position?.toLowerCase(),
            )
            .map((comparisonPlayer) => comparisonPlayer.height)
        : [];

      const playerWithMinutes = playersWithMinutes[index];
      const clubMinutes = playersWithMinutes
        .filter(
          (comparisonPlayer) =>
            comparisonPlayer.currentClubId === player.currentClubId,
        )
        .map((comparisonPlayer) => comparisonPlayer.minutesPlayed);
      const leagueMinutes = playersWithMinutes
        .filter(
          (comparisonPlayer) =>
            comparisonPlayer.currentClub?.leagueId ===
            player.currentClub?.leagueId,
        )
        .map((comparisonPlayer) => comparisonPlayer.minutesPlayed);
      const positionMinutes = player.position
        ? playersWithMinutes
            .filter(
              (comparisonPlayer) =>
                comparisonPlayer.position?.toLowerCase() ===
                player.position?.toLowerCase(),
            )
            .map((comparisonPlayer) => comparisonPlayer.minutesPlayed)
        : [];

      await syncPlayerMetrics(
        player.id,
        season,
        {
          overall: percentile(player.height, overallHeights),
          position: percentile(player.height, positionHeights),
        },
        {
          club: minutesRank(playerWithMinutes.minutesPlayed, clubMinutes),
          league: minutesRank(playerWithMinutes.minutesPlayed, leagueMinutes),
          position: minutesRank(
            playerWithMinutes.minutesPlayed,
            positionMinutes,
          ),
        },
      );

      succeeded++;

      console.log(`${progress} ✓ ${player.name}`);
    } catch (error) {
      failed++;

      console.error(
        `${progress} ✗ Failed for ${player.name} (${player.id})`,
        error,
      );
    }
  }

  console.log("");
  console.log("✅ Metrics build complete");
  console.log(`   Successful: ${succeeded}`);
  console.log(`   Failed:     ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Fatal metrics build error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
