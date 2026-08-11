import { prisma } from "@/lib/prisma";
import { TOP_FIVE_LEAGUE_IDS, TRANSFER_SEASON } from "@/lib/sync/scope";
import { getLastThreeTransferSeasons } from "@/lib/transfers/get-last-three-transfer-seasons";

export async function getHomePageData() {
  const efficiencySeasons = getLastThreeTransferSeasons(TRANSFER_SEASON);

  const [
    latestTransfers,
    spendingGroups,
    efficiencyTransfers,
    bestValueTransferRows,
    mostExpensiveTransfers,
  ] = await Promise.all([
    prisma.transfer.findMany({
      where: {
        season: TRANSFER_SEASON,

        OR: [
          {
            fromClub: {
              is: {
                league: {
                  is: {
                    transfermarktId: {
                      in: [...TOP_FIVE_LEAGUE_IDS],
                    },
                  },
                },
              },
            },
          },
          {
            toClub: {
              is: {
                league: {
                  is: {
                    transfermarktId: {
                      in: [...TOP_FIVE_LEAGUE_IDS],
                    },
                  },
                },
              },
            },
          },
        ],
      },

      take: 10,

      orderBy: [
        {
          transferDate: {
            sort: "desc",
            nulls: "last",
          },
        },
        {
          createdAt: "desc",
        },
      ],

      select: {
          id: true,
          transferDate: true,
          fee: true,
          transferType: true,
          marketValue: true,

        player: {
          select: {
            name: true,
            slug: true,
          },
        },

        fromClub: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
          },
        },

        toClub: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    }),

    prisma.transfer.groupBy({
      by: ["toClubId"],

      where: {
        season: TRANSFER_SEASON,

        toClubId: {
          not: null,
        },

        fee: {
          not: null,
          gt: 0,
        },

        toClub: {
          is: {
            league: {
              is: {
                transfermarktId: {
                  in: [...TOP_FIVE_LEAGUE_IDS],
                },
              },
            },
          },
        },
      },

      _sum: {
        fee: true,
      },

      _count: {
        id: true,
      },

      orderBy: {
        _sum: {
          fee: "desc",
        },
      },

      take: 10,
    }),

    prisma.transfer.findMany({
      where: {
        season: {
          in: efficiencySeasons,
        },

        fee: {
          not: null,
        },

        marketValue: {
          not: null,
          gt: 0,
        },

        OR: [
          {
            fromClub: {
              is: {
                league: {
                  is: {
                    transfermarktId: {
                      in: [...TOP_FIVE_LEAGUE_IDS],
                    },
                  },
                },
              },
            },
          },

          {
            toClub: {
              is: {
                league: {
                  is: {
                    transfermarktId: {
                      in: [...TOP_FIVE_LEAGUE_IDS],
                    },
                  },
                },
              },
            },
          },
        ],
      },

      select: {
        id: true,
        fee: true,
        marketValue: true,

        fromClubId: true,
        toClubId: true,

        fromClub: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,

            league: {
              select: {
                name: true,
                transfermarktId: true,
              },
            },
          },
        },

        toClub: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,

            league: {
              select: {
                name: true,
                transfermarktId: true,
              },
            },
          },
        },
      },
    }),

    prisma.transfer.findMany({
      where: {
        season: TRANSFER_SEASON,

        fee: {
          not: null,
        },

        marketValue: {
          not: null,
          gt: 0,
        },

        toClub: {
          is: {
            league: {
              is: {
                transfermarktId: {
                  in: [...TOP_FIVE_LEAGUE_IDS],
                },
              },
            },
          },
        },
      },

      select: {
        id: true,
        fee: true,
        marketValue: true,

        player: {
          select: {
            name: true,
            slug: true,
          },
        },

        fromClub: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
          },
        },

        toClub: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    }),

    prisma.transfer.findMany({
      where: {
        season: TRANSFER_SEASON,

        fee: {
          not: null,
          gt: 0,
        },

        OR: [
          {
            fromClub: {
              is: {
                league: {
                  is: {
                    transfermarktId: {
                      in: [...TOP_FIVE_LEAGUE_IDS],
                    },
                  },
                },
              },
            },
          },

          {
            toClub: {
              is: {
                league: {
                  is: {
                    transfermarktId: {
                      in: [...TOP_FIVE_LEAGUE_IDS],
                    },
                  },
                },
              },
            },
          },
        ],
      },

      take: 10,

      orderBy: [
        {
          fee: "desc",
        },
        {
          transferDate: {
            sort: "desc",
            nulls: "last",
          },
        },
      ],

      select: {
        id: true,
        fee: true,
        marketValue: true,

        player: {
          select: {
            name: true,
            slug: true,
          },
        },

        fromClub: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
          },
        },

        toClub: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    }),
  ]);

  const expensiveTransfers = mostExpensiveTransfers.flatMap((transfer) => {
    if (transfer.fee === null) {
      return [];
    }

    return [
      {
        ...transfer,
        fee: transfer.fee,
      },
    ];
  });

  const bestValueTransfers = bestValueTransferRows
    .flatMap((transfer) => {
      if (transfer.fee === null || transfer.marketValue === null) {
        return [];
      }

      const valueDifference = transfer.marketValue - transfer.fee;

      if (valueDifference <= 0) {
        return [];
      }

      return [
        {
          id: transfer.id,
          fee: transfer.fee,
          marketValue: transfer.marketValue,
          valueDifference,

          player: transfer.player,
          fromClub: transfer.fromClub,
          toClub: transfer.toClub,
        },
      ];
    })
    .sort(
      (first, second) =>
        second.valueDifference - first.valueDifference ||
        second.marketValue - first.marketValue,
    )
    .slice(0, 10);

  const worstValueTransfers = bestValueTransferRows
    .flatMap((transfer) => {
      if (transfer.fee === null || transfer.marketValue === null) {
        return [];
      }

      const valueDifference = transfer.fee - transfer.marketValue;

      if (valueDifference <= 0) {
        return [];
      }

      return [
        {
          id: transfer.id,
          fee: transfer.fee,
          marketValue: transfer.marketValue,
          valueDifference,

          player: transfer.player,
          fromClub: transfer.fromClub,
          toClub: transfer.toClub,
        },
      ];
    })
    .sort(
      (first, second) =>
        second.valueDifference - first.valueDifference ||
        second.fee - first.fee,
    )
    .slice(0, 10);

  interface ClubEfficiencyAccumulator {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    leagueName: string | null;

    incomingFees: number;
    outgoingFees: number;

    incomingValuation: number;
    outgoingValuation: number;

    incomingDeals: number;
    outgoingDeals: number;
  }

  const topFiveLeagueIdSet = new Set<string>(TOP_FIVE_LEAGUE_IDS);

  const efficiencyByClub = new Map<string, ClubEfficiencyAccumulator>();

  function getClubAccumulator(club: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    league: {
      name: string;
      transfermarktId: string | null;
    } | null;
  }) {
    const existing = efficiencyByClub.get(club.id);

    if (existing) {
      return existing;
    }

    const accumulator: ClubEfficiencyAccumulator = {
      id: club.id,
      name: club.name,
      slug: club.slug,
      logoUrl: club.logoUrl,
      leagueName: club.league?.name ?? null,

      incomingFees: 0,
      outgoingFees: 0,

      incomingValuation: 0,
      outgoingValuation: 0,

      incomingDeals: 0,
      outgoingDeals: 0,
    };

    efficiencyByClub.set(club.id, accumulator);

    return accumulator;
  }

  for (const transfer of efficiencyTransfers) {
    const fee = transfer.fee;
    const marketValue = transfer.marketValue;

    if (fee === null || marketValue === null) {
      continue;
    }

    const buyingClub = transfer.toClub;
    const sellingClub = transfer.fromClub;

    const buyingClubIsTopFive =
      buyingClub?.league?.transfermarktId &&
      topFiveLeagueIdSet.has(buyingClub.league.transfermarktId);

    const sellingClubIsTopFive =
      sellingClub?.league?.transfermarktId &&
      topFiveLeagueIdSet.has(sellingClub.league.transfermarktId);

    if (buyingClub && buyingClubIsTopFive) {
      const club = getClubAccumulator(buyingClub);

      club.incomingFees += fee;
      club.incomingValuation += marketValue;
      club.incomingDeals += 1;
    }

    if (sellingClub && sellingClubIsTopFive) {
      const club = getClubAccumulator(sellingClub);

      club.outgoingFees += fee;
      club.outgoingValuation += marketValue;
      club.outgoingDeals += 1;
    }
  }

  const mostEfficientClubs = Array.from(efficiencyByClub.values())
    .map((club) => {
      const purchaseValue = club.incomingValuation - club.incomingFees;

      const saleValue = club.outgoingFees - club.outgoingValuation;

      const efficiencyScore = purchaseValue + saleValue;

      const netSpend = club.incomingFees - club.outgoingFees;

      return {
        id: club.id,
        name: club.name,
        slug: club.slug,
        logoUrl: club.logoUrl,
        leagueName: club.leagueName,

        netSpend,
        efficiencyScore,
        purchaseValue,
        saleValue,

        ratedDeals: club.incomingDeals + club.outgoingDeals,
      };
    })
    .filter((club) => club.ratedDeals > 0)
    .sort((first, second) => second.efficiencyScore - first.efficiencyScore)
    .slice(0, 10);

  const spendingClubIds = spendingGroups
    .map((group) => group.toClubId)
    .filter((id): id is string => id !== null);

  const spendingClubs = await prisma.club.findMany({
    where: {
      id: {
        in: spendingClubIds,
      },
    },

    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,

      league: {
        select: {
          name: true,
        },
      },
    },
  });

  const spendingClubMap = new Map(spendingClubs.map((club) => [club.id, club]));

  const topSpenders = spendingGroups.flatMap((group) => {
    if (!group.toClubId) {
      return [];
    }

    const club = spendingClubMap.get(group.toClubId);

    if (!club) {
      return [];
    }

    return [
      {
        id: club.id,
        name: club.name,
        slug: club.slug,
        logoUrl: club.logoUrl,
        leagueName: club.league?.name ?? null,
        totalSpend: group._sum.fee ?? 0,
        signingCount: group._count.id,
      },
    ];
  });

  return {
    bestValueTransfers,
    efficiencySeasons,
    expensiveTransfers,
    latestTransfers,
    mostEfficientClubs,
    topSpenders,
    worstValueTransfers,
  };
}
