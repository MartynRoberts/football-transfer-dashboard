import type { PlayerStat } from "@prisma/client";

import { percentage } from "@/app/utils/percentage";
import { per90 } from "@/lib/players/formatters";
import type { SeasonPerformance } from "@/lib/players/types";

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

export function buildSeasonPerformances(
  playerStats: PlayerStat[],
  teamStats: TeamGoalStat[],
): SeasonPerformance[] {
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
      };
    });
}
