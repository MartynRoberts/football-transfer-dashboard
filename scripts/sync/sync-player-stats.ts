import { prisma } from "../../lib/prisma";
import { fetchFromApi } from "../../lib/sync/api";
import {
  getTopFiveFirstTeamClubIds,
  TOP_FIVE_LEAGUE_IDS,
} from "../../lib/sync/scope";

interface PlayerStatsResponse {
  updatedAt?: string;
  id?: string;
  stats: ApiPlayerStat[];
}

interface ApiPlayerStat {
  competitionId?: string | null;
  competitionName?: string | null;
  seasonId?: string | number | null;
  clubId?: string | null;

  appearances?: number | string | null;
  goals?: number | string | null;
  assists?: number | string | null;
  yellowCards?: number | string | null;
  redCards?: number | string | null;
  minutesPlayed?: number | string | null;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function getSeasonArgument(): string {
  const argument = process.argv.find((value) => value.startsWith("--season="));

  const season = argument?.split("=")[1]?.trim();

  if (!season) {
    throw new Error('Missing season argument. Example: --season="25/26"');
  }

  return season;
}

function toInteger(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.trunc(value) : 0;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[^\d-]/g, "").trim();

    if (!normalized) {
      return 0;
    }

    const parsed = Number.parseInt(normalized, 10);

    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function normalizeOptionalString(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function createPlayerStatId(params: {
  playerId: string;
  season: string;
  competitionId: string | null;
  clubId: string | null;
}): string {
  const competition = params.competitionId ?? "unknown-competition";
  const club = params.clubId ?? "unknown-club";

  return [params.playerId, params.season, competition, club].join(":");
}

export async function syncPlayerStats(): Promise<void> {
  const selectedSeason = getSeasonArgument();
  const force = process.argv.includes("--force");

  console.log(`📊 Syncing player stats for ${selectedSeason}`);
  console.log(`Mode: ${force ? "force refresh" : "missing only"}\n`);

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
  });

  console.log(`Found ${players.length} players\n`);

  const firstTeamClubIds = await getTopFiveFirstTeamClubIds();

  let syncedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let repairedCount = 0;

  let consecutiveEmptyResponses = 0;

  const MAX_CONSECUTIVE_EMPTY_RESPONSES = 10;

  playerLoop: for (const [index, player] of players.entries()) {
    const progress = `[${index + 1}/${players.length}]`;
    const transfermarktId = player.transfermarktId;

    if (!transfermarktId) {
      console.warn(`${progress} ⚠️ ${player.name} has no Transfermarkt ID`);

      failedCount++;
      continue;
    }

    try {
      const syncStateWhere = {
        entityType_entityId_syncType_season: {
          entityType: "PLAYER",
          entityId: transfermarktId,
          syncType: "STATS",
          season: selectedSeason,
        },
      } as const;

      const existingSync = await prisma.syncState.findUnique({
        where: syncStateWhere,
      });

      /*
       * Verify an existing sync marker actually has PlayerStat rows.
       *
       * This automatically repairs the false SyncState records created by
       * earlier versions of the script when the API returned stats: [].
       */
      if (existingSync && !force) {
        const existingRowCount = await prisma.playerStat.count({
          where: {
            playerId: player.id,
            season: selectedSeason,
          },
        });

        if (existingRowCount > 0) {
          console.log(
            `${progress} ⏭ ${player.name} — already synced ` +
              `(${existingRowCount} competition rows)`,
          );

          skippedCount++;
          continue;
        }

        console.warn(
          `${progress} 🛠 Removing stale sync marker for ${player.name}`,
        );

        await prisma.syncState.delete({
          where: syncStateWhere,
        });

        repairedCount++;
      }

      /*
       * In force mode, remove the old marker before requesting new data.
       *
       * Existing PlayerStat rows remain untouched unless a valid response
       * is received. If the API fails, the missing marker causes the player
       * to be retried on the next normal run.
       */
      if (existingSync && force) {
        await prisma.syncState.delete({
          where: syncStateWhere,
        });
      }

      console.log(`${progress} Syncing ${player.name}`);

      const response = await fetchFromApi<PlayerStatsResponse>(
        `/players/${transfermarktId}/stats`,
      );

      if (!response || !Array.isArray(response.stats)) {
        console.warn(
          `${progress} ⚠️ Invalid stats response for ${player.name}; ` +
            "will retry later",
        );

        failedCount++;
        await delay(500);
        continue;
      }

      /*
       * The local API currently sometimes returns HTTP 200 with stats: [].
       * Do not treat that as a successful sync because it may represent an
       * upstream scraping failure.
       */
      if (response.stats.length === 0) {
        consecutiveEmptyResponses++;

        console.warn(
          `${progress} ⚠️ Empty stats array for ${player.name}; ` +
            `not marking as synced ` +
            `(${consecutiveEmptyResponses}/${MAX_CONSECUTIVE_EMPTY_RESPONSES})`,
        );

        failedCount++;

        if (consecutiveEmptyResponses >= MAX_CONSECUTIVE_EMPTY_RESPONSES) {
          console.error(
            `\n❌ Stopping: the stats API returned empty arrays for ` +
              `${MAX_CONSECUTIVE_EMPTY_RESPONSES} consecutive players.`,
          );

          break playerLoop;
        }

        await delay(500);
        continue;
      }

      consecutiveEmptyResponses = 0;

      const availableSeasons = [
        ...new Set(
          response.stats
            .map((stat) => {
              if (stat.seasonId === null || stat.seasonId === undefined) {
                return null;
              }

              return String(stat.seasonId).trim();
            })
            .filter((season): season is string => Boolean(season)),
        ),
      ];

      const selectedSeasonStats = response.stats.filter((stat) => {
        if (stat.seasonId === null || stat.seasonId === undefined) {
          return false;
        }

        return String(stat.seasonId).trim() === selectedSeason;
      });

      if (selectedSeasonStats.length === 0) {
        console.warn(
          `${progress} ⚠️ Season "${selectedSeason}" was not returned ` +
            `for ${player.name}. Available seasons: ` +
            `${availableSeasons.join(", ") || "none"}`,
        );

        failedCount++;
        await delay(250);
        continue;
      }

      const seasonStats = selectedSeasonStats.filter((stat) => {
        const clubId = normalizeOptionalString(stat.clubId);

        return clubId !== null && firstTeamClubIds.has(clubId);
      });

      if (seasonStats.length === 0) {
        console.warn(
          `${progress} ⚠️ No ${selectedSeason} stats for a top-five ` +
            `first team were returned for ${player.name}`,
        );

        failedCount++;
        await delay(250);
        continue;
      }

      const filteredCount = selectedSeasonStats.length - seasonStats.length;

      if (filteredCount > 0) {
        console.log(
          `${progress} Filtered ${filteredCount} reserve, youth, ` +
            "national-team, or out-of-scope club rows",
        );
      }

      const statRows = seasonStats.map((stat) => {
        const competitionId = normalizeOptionalString(stat.competitionId);

        const clubId = normalizeOptionalString(stat.clubId);

        return {
          id: createPlayerStatId({
            playerId: player.id,
            season: selectedSeason,
            competitionId,
            clubId,
          }),

          playerId: player.id,
          competitionId,
          competitionName:
            normalizeOptionalString(stat.competitionName) ??
            "Unknown competition",

          season: selectedSeason,
          clubId,

          appearances: toInteger(stat.appearances),
          goals: toInteger(stat.goals),
          assists: toInteger(stat.assists),
          yellowCards: toInteger(stat.yellowCards),
          redCards: toInteger(stat.redCards),
          minutesPlayed: toInteger(stat.minutesPlayed),
        };
      });

      /*
       * Remove duplicate rows from the API using the deterministic ID.
       */
      const uniqueStatRows = [
        ...new Map(statRows.map((stat) => [stat.id, stat])).values(),
      ];

      /*
       * The delete, insert, and SyncState write happen atomically.
       *
       * If any operation fails, none of the database changes for this
       * player are committed.
       */
      await prisma.$transaction([
        prisma.playerStat.deleteMany({
          where: {
            playerId: player.id,
            season: selectedSeason,
          },
        }),

        prisma.playerStat.createMany({
          data: uniqueStatRows,
        }),

        prisma.syncState.upsert({
          where: syncStateWhere,

          update: {
            syncedAt: new Date(),
          },

          create: {
            entityType: "PLAYER",
            entityId: transfermarktId,
            syncType: "STATS",
            season: selectedSeason,
          },
        }),
      ]);

      console.log(
        `${progress} ✓ ${player.name}: ` +
          `${uniqueStatRows.length} competition rows`,
      );

      syncedCount++;
    } catch (error) {
      console.error(`${progress} ❌ Failed stats sync for ${player.name}`);

      console.error(error);

      failedCount++;
    }

    await delay(250);
  }

  console.log(`
✅ Player stats sync finished

Season: ${selectedSeason}
Synced: ${syncedCount}
Skipped: ${skippedCount}
Stale markers repaired: ${repairedCount}
Failed and retryable: ${failedCount}
`);
}

if (require.main === module) {
  syncPlayerStats()
    .catch((error) => {
      console.error("Fatal player stats sync error:");
      console.error(error);

      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
