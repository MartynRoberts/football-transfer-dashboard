import type { Prisma } from "@prisma/client";

export const playerPageInclude = {
  currentClub: {
    include: {
      league: true,
    },
  },

  stats: {
    orderBy: {
      season: "desc" as const,
    },
  },

  transfers: {
    include: {
      fromClub: true,
      toClub: true,
    },
    orderBy: {
      transferDate: "desc" as const,
    },
  },

  marketValueHistories: {
    orderBy: {
      date: "desc" as const,
    },
  },

  injuries: {
    orderBy: {
      startDate: "desc" as const,
    },
  },

  metric: true,
} satisfies Prisma.PlayerInclude;

export type PlayerWithPageRelations = Prisma.PlayerGetPayload<{
  include: typeof playerPageInclude;
}>;

export interface MarketValueChartPoint {
  date: string;
  marketValue: number;
  clubName: string | null;
}

export interface PerformanceRank {
  rank: number | null;
  total: number;
}

export interface PerformanceRankings {
  leaguePositionGoals: PerformanceRank;
  leaguePositionAssists: PerformanceRank;
  topFivePositionGoals: PerformanceRank;
  topFivePositionAssists: PerformanceRank;
}

export interface AvailabilityRank {
  rank: number | null;
  total: number;
}

export interface RecurrentInjuryWarning {
  hasWarning: boolean;
  description: string | null;
  occurrences: number;
}

export interface PlayerInjuryInsights {
  lastSeasonGamesMissed: number;
  lastSeasonTeamGames: number;
  lastSeasonInjuryPercentage: number | null;
  careerGamesMissed: number;
  careerTeamGames: number;
  careerInjuryPercentage: number | null;
  premierLeagueAvailabilityRank: AvailabilityRank;
  topFiveAvailabilityRank: AvailabilityRank;
  recurrentInjury: RecurrentInjuryWarning;
}

export interface SeasonPerformance {
  season: string;
  appearances: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cardsPerAppearance: number | null;
  cardsPer90: string;

  goalsPer90: string;
  assistsPer90: string;
  contributionsPer90: string;
  minutesPerContribution: number | null;

  involvement: {
    teamGoals: number;
    goalContributions: number;
    percentage: number | null;
  };

  rankings: PerformanceRankings;
}

export interface PlayerPageData {
  player: PlayerWithPageRelations;
  secondaryPositions: string[];
  marketValueChartData: MarketValueChartPoint[];
  seasonPerformances: SeasonPerformance[];
}
