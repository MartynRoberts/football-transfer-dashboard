import { prisma } from "../prisma";
import { fetchFromApi } from "./api";
import { MarketValueResponse } from "./types";

export async function syncPlayerMarketValue(
  playerId: string,
  transfermarktId: string,
) {
  const data = await fetchFromApi<MarketValueResponse>(
    `/players/${transfermarktId}/market_value`,
  );

  if (!data || !Number.isFinite(data.marketValue)) return false;

  const player = await prisma.player.findUnique({
    where: {
      id: playerId,
    },
    select: {
      position: true,
      currentClub: {
        select: {
          name: true,
        },
      },
    },
  });

  const ranking = data.ranking;

  const history = Array.isArray(data.marketValueHistory)
    ? data.marketValueHistory
        .map((item) => {
          const date = new Date(item.date);

          if (
            Number.isNaN(date.getTime()) ||
            !Number.isFinite(item.marketValue)
          ) {
            return null;
          }

          return {
            id: `${playerId}-${date.toISOString()}`,
            playerId,
            date,
            age: Number.isFinite(item.age) ? item.age : null,
            marketValue: item.marketValue,
            clubName: item.clubName?.trim() || null,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
    : [];

  const uniqueHistory = [
    ...new Map(history.map((item) => [item.id, item])).values(),
  ];

  await prisma.$transaction([
    prisma.player.update({
      where: {
        id: playerId,
      },
      data: {
        marketValue: data.marketValue,
        worldwideRank: ranking?.Worldwide ?? null,
        leagueRank:
          ranking?.["Premier League"] ??
          ranking?.Bundesliga ??
          ranking?.["La Liga"] ??
          ranking?.["Serie A"] ??
          ranking?.["Ligue 1"] ??
          null,
        clubRank: player?.currentClub?.name
          ? (ranking?.[player.currentClub.name] ?? null)
          : null,
        positionRank: player?.position
          ? (ranking?.[player.position] ?? null)
          : null,
      },
    }),
    prisma.marketValueHistory.deleteMany({
      where: {
        playerId,
      },
    }),
    prisma.marketValueHistory.createMany({
      data: uniqueHistory,
    }),
  ]);

  return true;
}
