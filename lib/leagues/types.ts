export interface LeagueAnalyticsIdentity {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  transfermarktId: string | null;
}

export interface LeagueFinanceRow extends LeagueAnalyticsIdentity {
  totalSpend: number;
  totalIncome: number;
  netSpend: number;
  efficiencyScore: number;
}

export interface LeagueSquadRow extends LeagueAnalyticsIdentity {
  averageSquadValue: number;
  averageAge: number | null;
  clubCount: number;
  playerCount: number;
}

export interface ClubInjuryRow {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  leagueName: string;
  injuryCount: number;
  playersAffected: number;
  gamesMissed: number;
  daysInjured: number;
}

export interface ClubDisciplineRow {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  leagueName: string;
  yellowCards: number;
  redCards: number;
  matchesCovered: number;
  cardsPerMatch: number;
}

export interface LeagueAnalyticsData {
  seasons: string[];
  injurySeason: string;
  finances: LeagueFinanceRow[];
  squads: LeagueSquadRow[];
  mostInjuryProne: ClubInjuryRow[];
  leastInjuryProne: ClubInjuryRow[];
}
