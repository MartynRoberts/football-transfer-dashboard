import type { Prisma } from "@prisma/client";

export const playerPageInclude = {
  currentClub: { include: { league: true } },
  stats: { orderBy: { season: "desc" as const } },
  transfers: {
    include: { fromClub: true, toClub: true },
    orderBy: { transferDate: "desc" as const },
  },
  marketValueHistories: { orderBy: { date: "desc" as const } },
  injuries: { orderBy: { startDate: "desc" as const } },
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

export interface SeasonPerformance {
  season: string;
  appearances: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  goalsPer90: string;
  assistsPer90: string;
  contributionsPer90: string;
  minutesPerContribution: number | null;
  involvement: {
    teamGoals: number;
    goalContributions: number;
    percentage: number | null;
  };
}

export interface PlayerPageData {
  player: PlayerWithPageRelations;
  secondaryPositions: string[];
  marketValueChartData: MarketValueChartPoint[];
  seasonPerformances: SeasonPerformance[];
}
