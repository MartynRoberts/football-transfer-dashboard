import type {
  AvailabilityRank,
  PlayerInjuryInsights,
  RecurrentInjuryWarning,
} from "@/lib/players/types";

interface InjuryRecord {
  description: string | null;
  startDate: Date | null;
  expectedReturn: Date | null;
  gamesMissed: number | null;
}

interface AvailabilityComparison {
  playerId: string;
  gamesMissed: number;
  teamGames: number;
}

interface BuildInjuryInsightsOptions {
  playerId: string;
  injuries: InjuryRecord[];

  lastSeasonStart: Date;
  lastSeasonEnd: Date;
  lastSeasonTeamGames: number;

  careerTeamGames: number;

  premierLeagueComparisons: AvailabilityComparison[];
  topFiveComparisons: AvailabilityComparison[];
}

function percentage(missedGames: number, teamGames: number): number | null {
  if (teamGames <= 0) {
    return null;
  }

  return Math.round((missedGames / teamGames) * 100);
}

function calculateAvailabilityRank(
  playerId: string,
  comparisons: AvailabilityComparison[],
): AvailabilityRank {
  const player = comparisons.find(
    (comparison) => comparison.playerId === playerId,
  );

  if (!player || player.teamGames <= 0) {
    return {
      rank: null,
      total: comparisons.length,
    };
  }

  const playerMissedPercentage = player.gamesMissed / player.teamGames;

  return {
    // Lower missed percentage means better availability.
    rank:
      comparisons.filter((comparison) => {
        if (comparison.teamGames <= 0) {
          return false;
        }

        return (
          comparison.gamesMissed / comparison.teamGames < playerMissedPercentage
        );
      }).length + 1,

    total: comparisons.length,
  };
}

function normalizeInjuryDescription(description: string | null): string | null {
  if (!description) {
    return null;
  }

  return description.trim().toLowerCase().replace(/\s+/g, " ");
}

function findRecurrentInjury(injuries: InjuryRecord[]): RecurrentInjuryWarning {
  const counts = injuries.reduce<Record<string, number>>((totals, injury) => {
    const description = normalizeInjuryDescription(injury.description);

    if (!description) {
      return totals;
    }

    totals[description] = (totals[description] ?? 0) + 1;

    return totals;
  }, {});

  const recurrentEntry = Object.entries(counts)
    .filter(([, occurrences]) => occurrences >= 2)
    .sort(
      ([, firstOccurrences], [, secondOccurrences]) =>
        secondOccurrences - firstOccurrences,
    )[0];

  if (!recurrentEntry) {
    return {
      hasWarning: false,
      description: null,
      occurrences: 0,
    };
  }

  const [description, occurrences] = recurrentEntry;

  return {
    hasWarning: true,
    description,
    occurrences,
  };
}

export function buildInjuryInsights({
  playerId,
  injuries,
  lastSeasonStart,
  lastSeasonEnd,
  lastSeasonTeamGames,
  careerTeamGames,
  premierLeagueComparisons,
  topFiveComparisons,
}: BuildInjuryInsightsOptions): PlayerInjuryInsights {
  const lastSeasonGamesMissed = injuries
    .filter((injury) => {
      if (!injury.startDate) {
        return false;
      }

      return (
        injury.startDate <= lastSeasonEnd &&
        (injury.expectedReturn === null ||
          injury.expectedReturn >= lastSeasonStart)
      );
    })
    .reduce((total, injury) => total + (injury.gamesMissed ?? 0), 0);

  const careerGamesMissed = injuries.reduce(
    (total, injury) => total + (injury.gamesMissed ?? 0),
    0,
  );

  return {
    lastSeasonGamesMissed,
    lastSeasonTeamGames,
    lastSeasonInjuryPercentage: percentage(
      lastSeasonGamesMissed,
      lastSeasonTeamGames,
    ),

    careerGamesMissed,
    careerTeamGames,
    careerInjuryPercentage: percentage(careerGamesMissed, careerTeamGames),

    premierLeagueAvailabilityRank: calculateAvailabilityRank(
      playerId,
      premierLeagueComparisons,
    ),

    topFiveAvailabilityRank: calculateAvailabilityRank(
      playerId,
      topFiveComparisons,
    ),

    recurrentInjury: findRecurrentInjury(injuries),
  };
}
