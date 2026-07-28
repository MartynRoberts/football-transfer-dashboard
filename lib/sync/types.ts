export interface ClubProfileResponse {
  id: string;
  name: string;
  image?: string;
  officialName?: string;
  stadiumName?: string;
  currentMarketValue?: number;
}

export interface ClubIdentityProps {
  club: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    league?: {
      name: string;
      slug: string;
    } | null;
  };
  showLeague?: boolean;
  link?: boolean;
  linkLeague?: boolean;
}

export interface ClubPlayersResponse {
  id: string;
  name: string;
  players: Array<{
    id: string;
    name: string;
    position?: string;
  }>;
}

export interface PlayerProfileResponse {
  id: string;
  name: string;
  imageUrl?: string;
  height?: number;
  citizenship?: string[];
  foot?: string;

  position?: {
    main?: string;
  };

  club?: {
    id: string;
    name: string;
    joined?: string;
    contractExpires?: string;
  };

  marketValue?: number;
}

export interface MarketValueResponse {
  marketValue: number;

  ranking?: {
    Worldwide?: number;
    "Premier League"?: number;
    Bundesliga?: number;
    "La Liga"?: number;
    "Serie A"?: number;
    "Ligue 1"?: number;
    [key: string]: number | undefined;
  };

  marketValueHistory: Array<{
    age: number;
    date: string;
    marketValue: number;
    clubName?: string;
  }>;
}

export interface InjuryResponse {
  injuries: Array<{
    season: string;
    injury: string;
    fromDate: string;
    untilDate?: string;
    days?: number;
    gamesMissed?: number;
    gamesMissedClubs?: string[];
  }>;
}

export interface TransfermarktPlayer {
  id: string;
  name: string;
  position?: string;
  nationality?: string[] | string;
  foot?: string;
  height?: number;
  joinedOn?: string;
  contract?: string;
}

export interface TransfermarktTransfer {
  id: string;
  season?: string;
  date?: string;

  fee?: number;
  marketValue?: number;

  clubFrom?: {
    id: string;
    name: string;
  };

  clubTo?: {
    id: string;
    name: string;
  };

  upcoming?: boolean;
}

export interface PlayerTransferResponse {
  id: string;
  name: string;
  transfers: TransfermarktTransfer[];
}
