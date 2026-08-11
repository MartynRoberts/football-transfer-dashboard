import "server-only";

import { prisma } from "@/lib/prisma";
import {
  CURRENT_SEASON,
  TOP_FIVE_LEAGUE_IDS,
  TRANSFER_SEASON,
} from "@/lib/sync/scope";
import { getLastThreeTransferSeasons } from "@/lib/transfers/get-last-three-transfer-seasons";
import type {
  ClubInjuryRow,
  LeagueAnalyticsData,
  LeagueFinanceRow,
} from "@/lib/leagues/types";

const compareInjuries = (first: ClubInjuryRow, second: ClubInjuryRow) =>
  second.gamesMissed - first.gamesMissed ||
  second.daysInjured - first.daysInjured ||
  second.injuryCount - first.injuryCount ||
  first.name.localeCompare(second.name);

export async function getLeagueAnalytics(): Promise<LeagueAnalyticsData> {
  const seasons = getLastThreeTransferSeasons(TRANSFER_SEASON);
  const [leagues, transfers] = await Promise.all([
    prisma.league.findMany({
      where: { transfermarktId: { in: [...TOP_FIVE_LEAGUE_IDS] } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        transfermarktId: true,
        clubs: {
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            players: {
              select: {
                id: true,
                marketValue: true,
                dateOfBirth: true,
                injuries: {
                  where: { season: CURRENT_SEASON },
                  select: { days: true, gamesMissed: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.transfer.findMany({
      where: {
        season: { in: seasons },
        OR: [
          {
            fromClub: {
              is: {
                league: {
                  is: { transfermarktId: { in: [...TOP_FIVE_LEAGUE_IDS] } },
                },
              },
            },
          },
          {
            toClub: {
              is: {
                league: {
                  is: { transfermarktId: { in: [...TOP_FIVE_LEAGUE_IDS] } },
                },
              },
            },
          },
        ],
      },
      select: {
        fee: true,
        marketValue: true,
        fromClub: { select: { leagueId: true } },
        toClub: { select: { leagueId: true } },
      },
    }),
  ]);

  const leagueById = new Map(leagues.map((league) => [league.id, league]));
  const financeByLeague = new Map<string, LeagueFinanceRow>(
    leagues.map((league) => [
      league.id,
      {
        id: league.id,
        name: league.name,
        slug: league.slug,
        country: league.country,
        transfermarktId: league.transfermarktId,
        totalSpend: 0,
        totalIncome: 0,
        netSpend: 0,
        efficiencyScore: 0,
      },
    ]),
  );

  for (const transfer of transfers) {
    const fee = transfer.fee;
    const marketValue = transfer.marketValue;
    const buyingLeagueId = transfer.toClub?.leagueId;
    const sellingLeagueId = transfer.fromClub?.leagueId;

    if (buyingLeagueId && leagueById.has(buyingLeagueId) && fee !== null) {
      const league = financeByLeague.get(buyingLeagueId)!;
      league.totalSpend += fee;
      if (marketValue !== null) league.efficiencyScore += marketValue - fee;
    }

    if (sellingLeagueId && leagueById.has(sellingLeagueId) && fee !== null) {
      const league = financeByLeague.get(sellingLeagueId)!;
      league.totalIncome += fee;
      if (marketValue !== null) league.efficiencyScore += fee - marketValue;
    }
  }

  const finances = [...financeByLeague.values()]
    .map((league) => ({
      ...league,
      netSpend: league.totalSpend - league.totalIncome,
    }))
    .sort((first, second) => second.totalSpend - first.totalSpend);

  const now = Date.now();
  const millisecondsPerYear = 365.2425 * 24 * 60 * 60 * 1000;
  const allClubInjuries: ClubInjuryRow[] = [];

  const squads = leagues.map((league) => {
    let totalSquadValue = 0;
    let totalAge = 0;
    let playersWithAge = 0;
    let playerCount = 0;

    for (const club of league.clubs) {
      const affectedPlayers = new Set<string>();
      let injuryCount = 0;
      let gamesMissed = 0;
      let daysInjured = 0;

      for (const player of club.players) {
        playerCount += 1;
        totalSquadValue += player.marketValue ?? 0;

        if (player.dateOfBirth) {
          totalAge +=
            (now - player.dateOfBirth.getTime()) / millisecondsPerYear;
          playersWithAge += 1;
        }

        for (const injury of player.injuries) {
          injuryCount += 1;
          gamesMissed += injury.gamesMissed ?? 0;
          daysInjured += injury.days ?? 0;
          affectedPlayers.add(player.id);
        }
      }

      allClubInjuries.push({
        id: club.id,
        name: club.name,
        slug: club.slug,
        logoUrl: club.logoUrl,
        leagueName: league.name,
        injuryCount,
        playersAffected: affectedPlayers.size,
        gamesMissed,
        daysInjured,
      });
    }

    return {
      id: league.id,
      name: league.name,
      slug: league.slug,
      country: league.country,
      transfermarktId: league.transfermarktId,
      averageSquadValue:
        league.clubs.length > 0 ? totalSquadValue / league.clubs.length : 0,
      averageAge: playersWithAge > 0 ? totalAge / playersWithAge : null,
      clubCount: league.clubs.length,
      playerCount,
    };
  });

  const injuryRanking = [...allClubInjuries].sort(compareInjuries);

  return {
    seasons,
    injurySeason: CURRENT_SEASON,
    finances,
    squads,
    mostInjuryProne: injuryRanking.slice(0, 5),
    leastInjuryProne: injuryRanking.slice(-5).reverse(),
  };
}

export async function getLeagueClubInjuryRanking({
  leagueId,
  leagueName,
}: {
  leagueId: string;
  leagueName: string;
}): Promise<ClubInjuryRow[]> {
  const clubs = await prisma.club.findMany({
    where: { leagueId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      players: {
        select: {
          id: true,
          injuries: {
            where: { season: CURRENT_SEASON },
            select: { days: true, gamesMissed: true },
          },
        },
      },
    },
  });

  return clubs
    .map((club) => {
      const affectedPlayers = new Set<string>();
      let injuryCount = 0;
      let gamesMissed = 0;
      let daysInjured = 0;

      for (const player of club.players) {
        for (const injury of player.injuries) {
          injuryCount += 1;
          gamesMissed += injury.gamesMissed ?? 0;
          daysInjured += injury.days ?? 0;
          affectedPlayers.add(player.id);
        }
      }

      return {
        id: club.id,
        name: club.name,
        slug: club.slug,
        logoUrl: club.logoUrl,
        leagueName,
        injuryCount,
        playersAffected: affectedPlayers.size,
        gamesMissed,
        daysInjured,
      };
    })
    .sort(compareInjuries);
}

export async function getLeagueDetailAnalytics(leagueId: string) {
  const efficiencySeasons = getLastThreeTransferSeasons(TRANSFER_SEASON);
  const transferWhere = {
    season: TRANSFER_SEASON,
    OR: [{ fromClub: { is: { leagueId } } }, { toClub: { is: { leagueId } } }],
  };

  const [clubs, transfers, latestTransfers, efficiencyTransfers] =
    await Promise.all([
      prisma.club.findMany({
        where: { leagueId },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          league: { select: { name: true } },
          players: { select: { marketValue: true, dateOfBirth: true } },
        },
      }),
      prisma.transfer.findMany({
        where: transferWhere,
        select: {
          id: true,
          fee: true,
          marketValue: true,
          fromClubId: true,
          toClubId: true,
          player: { select: { name: true, slug: true } },
          fromClub: { select: { name: true, slug: true, logoUrl: true } },
          toClub: { select: { name: true, slug: true, logoUrl: true } },
        },
      }),
      prisma.transfer.findMany({
        where: transferWhere,
        orderBy: [{ transferDate: "desc" }, { createdAt: "desc" }],
        take: 10,
        select: {
          id: true,
          transferDate: true,
          fee: true,
          transferType: true,
          marketValue: true,
          player: { select: { name: true, slug: true } },
          fromClub: { select: { name: true, slug: true, logoUrl: true } },
          toClub: { select: { name: true, slug: true, logoUrl: true } },
        },
      }),
      prisma.transfer.findMany({
        where: {
          season: { in: efficiencySeasons },
          fee: { not: null },
          marketValue: { not: null, gt: 0 },
          OR: [
            { fromClub: { is: { leagueId } } },
            { toClub: { is: { leagueId } } },
          ],
        },
        select: {
          fee: true,
          marketValue: true,
          fromClubId: true,
          toClubId: true,
        },
      }),
    ]);

  const now = Date.now();
  const millisecondsPerYear = 365.2425 * 24 * 60 * 60 * 1000;
  const clubRows = clubs.map((club) => {
    const playersWithAge = club.players.filter((player) => player.dateOfBirth);
    const totalAge = playersWithAge.reduce(
      (sum, player) =>
        sum + (now - player.dateOfBirth!.getTime()) / millisecondsPerYear,
      0,
    );

    return {
      id: club.id,
      name: club.name,
      slug: club.slug,
      logoUrl: club.logoUrl,
      totalSpend: 0,
      totalIncome: 0,
      incomingCount: 0,
      outgoingCount: 0,
      netSpend: 0,
      squadValue: club.players.reduce(
        (sum, player) => sum + (player.marketValue ?? 0),
        0,
      ),
      averageAge:
        playersWithAge.length > 0 ? totalAge / playersWithAge.length : null,
      playerCount: club.players.length,
      leagueName: club.league?.name ?? null,
    };
  });
  const clubById = new Map(clubRows.map((club) => [club.id, club]));

  for (const transfer of transfers) {
    const buyer = transfer.toClubId ? clubById.get(transfer.toClubId) : null;
    const seller = transfer.fromClubId
      ? clubById.get(transfer.fromClubId)
      : null;
    if (buyer) {
      buyer.incomingCount += 1;
      buyer.totalSpend += transfer.fee ?? 0;
    }
    if (seller) {
      seller.outgoingCount += 1;
      seller.totalIncome += transfer.fee ?? 0;
    }
  }

  for (const club of clubRows) {
    club.netSpend = club.totalSpend - club.totalIncome;
  }

  const efficiencyByClub = new Map(
    clubRows.map((club) => [
      club.id,
      {
        id: club.id,
        name: club.name,
        slug: club.slug,
        logoUrl: club.logoUrl,
        leagueName: club.leagueName,
        incomingFees: 0,
        outgoingFees: 0,
        incomingValuation: 0,
        outgoingValuation: 0,
        incomingDeals: 0,
        outgoingDeals: 0,
      },
    ]),
  );

  for (const transfer of efficiencyTransfers) {
    const fee = transfer.fee;
    const marketValue = transfer.marketValue;
    if (fee === null || marketValue === null) continue;

    const buyer = transfer.toClubId
      ? efficiencyByClub.get(transfer.toClubId)
      : null;
    const seller = transfer.fromClubId
      ? efficiencyByClub.get(transfer.fromClubId)
      : null;

    if (buyer) {
      buyer.incomingFees += fee;
      buyer.incomingValuation += marketValue;
      buyer.incomingDeals += 1;
    }
    if (seller) {
      seller.outgoingFees += fee;
      seller.outgoingValuation += marketValue;
      seller.outgoingDeals += 1;
    }
  }

  const efficientClubs = [...efficiencyByClub.values()]
    .map((club) => {
      const purchaseValue = club.incomingValuation - club.incomingFees;
      const saleValue = club.outgoingFees - club.outgoingValuation;
      return {
        id: club.id,
        name: club.name,
        slug: club.slug,
        logoUrl: club.logoUrl,
        leagueName: club.leagueName,
        netSpend: club.incomingFees - club.outgoingFees,
        efficiencyScore: purchaseValue + saleValue,
        purchaseValue,
        saleValue,
        ratedDeals: club.incomingDeals + club.outgoingDeals,
      };
    })
    .filter((club) => club.ratedDeals > 0)
    .sort((first, second) => second.efficiencyScore - first.efficiencyScore)
    .slice(0, 10);

  return {
    season: TRANSFER_SEASON,
    efficiencySeasons,
    efficientClubs,
    latestTransfers,
    expensiveTransfers: transfers
      .filter((transfer): transfer is typeof transfer & { fee: number } =>
        Number.isFinite(transfer.fee),
      )
      .sort((first, second) => second.fee - first.fee)
      .slice(0, 10),
    clubs: clubRows,
  };
}
