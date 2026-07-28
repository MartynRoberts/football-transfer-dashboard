import { prisma } from "../prisma";
import { fetchFromApi } from "./api";

interface MarketValueResponse {
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

export async function syncPlayerMarketValue(
  playerId: string,
  transfermarktId: string,
) {
  const data = await fetchFromApi<MarketValueResponse>(
    `/players/${transfermarktId}/market_value`,
  );

  if (!data) return;

  await prisma.player.update({
    where: {
      id: playerId,
    },

    data: {
      marketValue: data.marketValue,

      worldwideRank: data.ranking?.Worldwide ?? null,

      leagueRank:
        data.ranking?.["Premier League"] ??
        data.ranking?.Bundesliga ??
        data.ranking?.["La Liga"] ??
        data.ranking?.["Serie A"] ??
        data.ranking?.["Ligue 1"] ??
        null,
    },
  });

  await prisma.marketValueHistory.deleteMany({
    where: {
      playerId,
    },
  });

  await prisma.marketValueHistory.createMany({
    data: data.marketValueHistory.map((item) => ({
      id: `${playerId}-${item.date}`,

      playerId,

      date: new Date(item.date),

      age: item.age,

      marketValue: item.marketValue,

      clubName: item.clubName ?? null,
    })),
  });
}
