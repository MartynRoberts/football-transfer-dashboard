import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClubIdentity from "@/components/clubs/ClubIdentity";
import LeagueIdentity from "@/components/leagues/LeagueIdentity";
import PlayerCardImage from "@/components/players/PlayerCardImage";
import { CURRENT_SEASON } from "@/lib/sync/scope";
import SquadPositionCounts from "@/components/clubs/SquadPositionCounts";
import TransferValueRating from "@/components/transfers/TransferValueRating";

function getLastThreeSeasons(currentSeason: string): string[] {
  const match = currentSeason.match(/^(\d{2})\/(\d{2})$/);

  if (!match) {
    return [currentSeason];
  }

  const startYear = Number(match[1]);

  return Array.from({ length: 3 }, (_, index) => {
    const seasonStart = startYear - index;
    const seasonEnd = (seasonStart + 1) % 100;

    return `${seasonStart.toString().padStart(2, "0")}/${seasonEnd
      .toString()
      .padStart(2, "0")}`;
  });
}

function formatNetSpend(value: number): {
  value: string;
  detail: string;
} {
  const formattedValue = `€${Math.abs(value).toLocaleString()}`;

  if (value > 0) {
    return {
      value: formattedValue,
      detail: "(Based on known fees)",
    };
  }

  if (value < 0) {
    return {
      value: formattedValue,
      detail: "Net transfer profit",
    };
  }

  return {
    value: "€0",
    detail: "Balanced transfer activity",
  };
}

function TransferFee({ fee }: { fee: number | null }) {
  if (fee === null) {
    return "Undisclosed";
  }

  if (fee === 0) {
    return "Free";
  }

  return `€${fee.toLocaleString()}`;
}

function MarketValue({ marketValue }: { marketValue: number | null }) {
  if (marketValue === null) {
    return "-";
  }

  return `€${marketValue.toLocaleString()}`;
}

export default async function ClubPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string }>;
}) {
  const { slug } = await params;
  const season = CURRENT_SEASON;

  const club = await prisma.club.findUnique({
    where: { slug },
    include: {
      league: true,

      players: {
        orderBy: [
          {
            shirtNumber: {
              sort: "asc",
              nulls: "last",
            },
          },
          {
            name: "asc",
          },
        ],
      },

      incomingTransfers: {
        where: {
          season: CURRENT_SEASON,
        },
        include: {
          player: true,
          fromClub: true,
        },
        orderBy: {
          transferDate: "desc",
        },
        take: 10,
      },

      outgoingTransfers: {
        where: {
          season: CURRENT_SEASON,
        },
        include: {
          player: true,
          toClub: true,
        },
        orderBy: {
          transferDate: "desc",
        },
        take: 10,
      },

      _count: {
        select: {
          players: true,

          incomingTransfers: {
            where: {
              season: CURRENT_SEASON,
            },
          },

          outgoingTransfers: {
            where: {
              season: CURRENT_SEASON,
            },
          },
        },
      },
    },
  });

  if (!club) {
    notFound();
  }

  const lastThreeSeasons = getLastThreeSeasons(CURRENT_SEASON);

  const [
    currentSeasonIncoming,
    currentSeasonOutgoing,
    threeYearIncoming,
    threeYearOutgoing,
  ] = await Promise.all([
    prisma.transfer.aggregate({
      where: {
        toClubId: club.id,
        season: CURRENT_SEASON,
        fee: {
          not: null,
        },
      },
      _sum: {
        fee: true,
      },
    }),

    prisma.transfer.aggregate({
      where: {
        fromClubId: club.id,
        season: CURRENT_SEASON,
        fee: {
          not: null,
        },
      },
      _sum: {
        fee: true,
      },
    }),

    prisma.transfer.aggregate({
      where: {
        toClubId: club.id,
        season: {
          in: lastThreeSeasons,
        },
        fee: {
          not: null,
        },
      },
      _sum: {
        fee: true,
      },
    }),

    prisma.transfer.aggregate({
      where: {
        fromClubId: club.id,
        season: {
          in: lastThreeSeasons,
        },
        fee: {
          not: null,
        },
      },
      _sum: {
        fee: true,
      },
    }),
  ]);

  const currentSeasonNetSpend =
    (currentSeasonIncoming._sum.fee ?? 0) -
    (currentSeasonOutgoing._sum.fee ?? 0);

  const threeYearNetSpend =
    (threeYearIncoming._sum.fee ?? 0) - (threeYearOutgoing._sum.fee ?? 0);

  const currentSeasonNetSpendDisplay = formatNetSpend(currentSeasonNetSpend);

  const threeYearNetSpendDisplay = formatNetSpend(threeYearNetSpend);

  return (
    <main className="container mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section>
        <div className="flex justify-between items-center">
          <ClubIdentity club={club} showLeague={false} link={false} h1={true} />
          {club.league && <LeagueIdentity league={club.league} link={true} />}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Squad Size</p>
            <p className="text-2xl font-bold">{club._count.players}</p>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Arrivals</p>
            <p className="text-2xl font-bold">
              {club._count.incomingTransfers}
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Departures</p>
            <p className="text-2xl font-bold">
              {club._count.outgoingTransfers}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">Net spend this season</p>

            <p className="text-2xl font-bold">
              {currentSeasonNetSpendDisplay.value}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {currentSeasonNetSpendDisplay.detail}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">Net spend — last 3 seasons</p>

            <p className="text-2xl font-bold">
              {threeYearNetSpendDisplay.value}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {threeYearNetSpendDisplay.detail}
            </p>
          </div>
        </div>
      </section>

      {/* Incoming Transfers */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Incoming Transfers</h2>

        {club.incomingTransfers.length === 0 ? (
          <p className="text-gray-500">No incoming transfers.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left">Player</th>
                  <th className="p-3 text-left">From</th>
                  <th className="p-3 text-left">Fee</th>
                  <th className="p-3 text-left">Market Value</th>
                  <th className="p-3 text-left">Value rating</th>
                </tr>
              </thead>

              <tbody>
                {club.incomingTransfers.map((transfer) => (
                  <tr key={transfer.id} className="border-b">
                    <td className="p-3">
                      <Link
                        href={`/players/${transfer.player.slug}`}
                        className="text-blue-600 hover:underline"
                      >
                        {transfer.player.name}
                      </Link>
                    </td>

                    <td className="p-3">
                      {transfer.fromClub?.name ?? "Free Agent"}
                    </td>

                    <td className="p-3">
                      <TransferFee fee={transfer.fee} />
                    </td>

                    <td className="p-3">
                      <MarketValue marketValue={transfer.marketValue} />
                    </td>

                    <td className="p-3">
                      <TransferValueRating
                        fee={transfer.fee}
                        marketValue={transfer.marketValue}
                        perspective="buyer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Outgoing Transfers */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Outgoing Transfers</h2>

        {club.outgoingTransfers.length === 0 ? (
          <p className="text-gray-500">No outgoing transfers.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left">Player</th>
                  <th className="p-3 text-left">To</th>
                  <th className="p-3 text-left">Fee</th>
                  <th className="p-3 text-left">Market Value</th>
                  <th className="p-3 text-left">Sale rating</th>
                </tr>
              </thead>

              <tbody>
                {club.outgoingTransfers.map((transfer) => (
                  <tr key={transfer.id} className="border-b">
                    <td className="p-3">
                      <Link
                        href={`/players/${transfer.player.slug}`}
                        className="text-blue-600 hover:underline"
                      >
                        {transfer.player.name}
                      </Link>
                    </td>

                    <td className="p-3">
                      {transfer.toClub?.name ?? "Free Agent"}
                    </td>

                    <td className="p-3">
                      <TransferFee fee={transfer.fee} />
                    </td>

                    <td className="p-3">
                      <MarketValue marketValue={transfer.marketValue} />
                    </td>

                    <td className="p-3">
                      <TransferValueRating
                        fee={transfer.fee}
                        marketValue={transfer.marketValue}
                        perspective="seller"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <SquadPositionCounts players={club.players} />

      {/* Squad */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Squad members</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {club.players.map((player) => (
            <Link
              key={player.id}
              href={`/players/${player.slug}`}
              className="flex min-h-28 items-stretch overflow-hidden rounded-lg border p-0 transition hover:border-blue-500"
            >
              <div className="min-w-0 flex-1 px-4 py-4">
                <p className="font-semibold">
                  <span>#{player.shirtNumber ?? "—"}</span> {player.name}
                </p>

                <p className="text-sm text-gray-500">
                  {player.position ?? "Unknown"}
                </p>
              </div>

              <PlayerCardImage src={player.imageUrl} playerName={player.name} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
