import { prisma } from "@/lib/prisma";
import { fetchFromApi } from "./api";

interface StatsResponse {
  updatedAt?: string;
  id?: string;

  stats: Array<{
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
  }>;
}

export type PlayerStatsSyncResult =
  | {
      status: "success";
      rows: number;
    }
  | {
      status: "empty-response";
      rows: 0;
    }
  | {
      status: "season-not-found";
      rows: 0;
      availableSeasons: string[];
    }
  | {
      status: "request-failed";
      rows: 0;
    };

function toInteger(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.trunc(value) : 0;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[^\d-]/g, "");

    if (!normalized) {
      return 0;
    }

    const parsed = Number.parseInt(normalized, 10);

    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function normalizeString(value: string | null | undefined): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function createStatId(params: {
  playerId: string;
  season: string;
  competitionId: string | null;
  clubId: string | null;
}): string {
  return [
    params.playerId,
    params.season,
    params.competitionId ?? "unknown-competition",
    params.clubId ?? "unknown-club",
  ].join(":");
}

export async function syncPlayerStats(
  playerId: string,
  transfermarktId: string,
  selectedSeason: string,
): Promise<PlayerStatsSyncResult> {
  const data = await fetchFromApi<StatsResponse>(
    `/players/${transfermarktId}/stats`,
  );

  if (!data || !Array.isArray(data.stats)) {
    return {
      status: "request-failed",
      rows: 0,
    };
  }

  /*
   * The API currently returns HTTP 200 with stats: [] when its scraper
   * fails. Do not delete existing data or mark the sync as complete.
   */
  if (data.stats.length === 0) {
    return {
      status: "empty-response",
      rows: 0,
    };
  }

  const availableSeasons = [
    ...new Set(
      data.stats
        .map((stat) => {
          if (stat.seasonId === null || stat.seasonId === undefined) {
            return null;
          }

          return String(stat.seasonId).trim();
        })
        .filter((season): season is string => Boolean(season)),
    ),
  ];

  const selectedStats = data.stats.filter((stat) => {
    if (stat.seasonId === null || stat.seasonId === undefined) {
      return false;
    }

    return String(stat.seasonId).trim() === selectedSeason;
  });

  if (selectedStats.length === 0) {
    return {
      status: "season-not-found",
      rows: 0,
      availableSeasons,
    };
  }

  const rows = selectedStats.map((stat) => {
    const competitionId = normalizeString(stat.competitionId);
    const clubId = normalizeString(stat.clubId);

    return {
      id: createStatId({
        playerId,
        season: selectedSeason,
        competitionId,
        clubId,
      }),

      playerId,
      competitionId,
      competitionName:
        normalizeString(stat.competitionName) ?? "Unknown competition",

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

  const uniqueRows = [...new Map(rows.map((row) => [row.id, row])).values()];

  await prisma.$transaction([
    prisma.playerStat.deleteMany({
      where: {
        playerId,
        season: selectedSeason,
      },
    }),

    prisma.playerStat.createMany({
      data: uniqueRows,
    }),
  ]);

  return {
    status: "success",
    rows: uniqueRows.length,
  };
}
