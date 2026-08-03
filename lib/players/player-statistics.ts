import type { PlayerStat } from "@prisma/client";

import { per90 } from "@/lib/players/formatters";
import type { PerformanceRank, SeasonPerformance } from "@/lib/players/types";
import { percentage } from "@/utils/percentage";

interface SeasonTotals {
  season: string;
  appearances: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
}

interface StatScope {
  season: string;
  clubId: string | null;
  competitionId: string | null;
}

type TeamGoalStat = Pick<
  PlayerStat,
  "season" | "clubId" | "competitionId" | "goals"
>;

export interface ComparisonPlayerPerformance {
  playerId: string;
  leagueId: string | null;
  position: string | null;
  season: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
}

interface BuildSeasonPerformancesOptions {
  playerId: string;
  playerPosition: string | null;
  playerLeagueId: string | null;
  comparisonPerformances: ComparisonPlayerPerformance[];
}

export function statScopeKey(scope: StatScope): string {
  return `${scope.season}:${scope.clubId}:${scope.competitionId}`;
}

export function getUniqueStatScopes(stats: PlayerStat[]): StatScope[] {
  return Array.from(
    new Map(
      stats.map((stat) => {
        const scope = {
          season: stat.season,
          clubId: stat.clubId,
          competitionId: stat.competitionId,
        };

        return [statScopeKey(scope), scope];
      }),
    ).values(),
  );
}

function normalizePosition(position: string | null): string | null {
  return position?.trim().toLowerCase() ?? null;
}

function calculateRank(
  playerId: string,
  performances: ComparisonPlayerPerformance[],
  field: "goals" | "assists",
): PerformanceRank {
  const playerPerformance = performances.find(
    (performance) => performance.playerId === playerId,
  );

  if (!playerPerformance) {
    return {
      rank: null,
      total: performances.length,
    };
  }

  const playerValue = playerPerformance[field];

  return {
    rank:
      performances.filter((performance) => performance[field] > playerValue)
        .length + 1,
    total: performances.length,
  };
}

export function buildSeasonPerformances(
  playerStats: PlayerStat[],
  teamStats: TeamGoalStat[],
  options: BuildSeasonPerformancesOptions,
): SeasonPerformance[] {
  const { playerId, playerPosition, playerLeagueId, comparisonPerformances } =
    options;

  const totalsBySeason = playerStats.reduce<Record<string, SeasonTotals>>(
    (seasons, stat) => {
      const totals = seasons[stat.season] ?? {
        season: stat.season,
        appearances: 0,
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
      };

      totals.appearances += stat.appearances;
      totals.minutesPlayed += stat.minutesPlayed;
      totals.goals += stat.goals;
      totals.assists += stat.assists;

      seasons[stat.season] = totals;

      return seasons;
    },
    {},
  );

  const teamGoalsByScope = teamStats.reduce<Record<string, number>>(
    (totals, stat) => {
      const key = statScopeKey(stat);

      totals[key] = (totals[key] ?? 0) + stat.goals;

      return totals;
    },
    {},
  );

  const normalizedPlayerPosition = normalizePosition(playerPosition);

  return Object.values(totalsBySeason)
    .sort((first, second) => second.season.localeCompare(first.season))
    .map((season) => {
      const teamGoals = playerStats
        .filter((stat) => stat.season === season.season)
        .reduce(
          (total, stat) => total + (teamGoalsByScope[statScopeKey(stat)] ?? 0),
          0,
        );

      const goalContributions = season.goals + season.assists;

      const samePositionTopFive = normalizedPlayerPosition
        ? comparisonPerformances.filter(
            (performance) =>
              performance.season === season.season &&
              performance.minutesPlayed > 0 &&
              normalizePosition(performance.position) ===
                normalizedPlayerPosition,
          )
        : [];

      const samePositionLeague = playerLeagueId
        ? samePositionTopFive.filter(
            (performance) => performance.leagueId === playerLeagueId,
          )
        : [];

      return {
        ...season,

        goalsPer90: per90(season.goals, season.minutesPlayed),

        assistsPer90: per90(season.assists, season.minutesPlayed),

        contributionsPer90: per90(goalContributions, season.minutesPlayed),

        minutesPerContribution:
          goalContributions > 0
            ? Math.round(season.minutesPlayed / goalContributions)
            : null,

        involvement: {
          teamGoals,
          goalContributions,
          percentage: percentage(goalContributions, teamGoals),
        },

        rankings: {
          leaguePositionGoals: calculateRank(
            playerId,
            samePositionLeague,
            "goals",
          ),

          leaguePositionAssists: calculateRank(
            playerId,
            samePositionLeague,
            "assists",
          ),

          topFivePositionGoals: calculateRank(
            playerId,
            samePositionTopFive,
            "goals",
          ),

          topFivePositionAssists: calculateRank(
            playerId,
            samePositionTopFive,
            "assists",
          ),
        },
      };
    });
}
