import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { searchCompetition, getCompetitionClubs } from "@/lib/transfermarkt";
import LeagueIdentity from "@/components/leagues/LeagueIdentity";

export const revalidate = 60;

export default async function HomePage() {
  const [leagues, topClubs, latestTransfers] = await Promise.all([
    prisma.league.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { clubs: true },
        },
      },
    }),

    prisma.club.findMany({
      take: 12,
      orderBy: { name: "asc" },
      include: {
        league: true,
        _count: {
          select: { players: true },
        },
      },
    }),

    prisma.transfer.findMany({
      take: 8,
      orderBy: { transferDate: "desc" },
      include: {
        player: true,
        fromClub: true,
        toClub: true,
      },
    }),
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Header */}
      <section className="mb-12 text-center py-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl shadow-lg px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          TransferDashboard
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Explore football transfer activity, squad valuations, net spend
          insights, and league analytics.
        </p>
      </section>

      {/* Main Grid: Leagues & Latest Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Leagues Section */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Leagues</h2>
          <p className="mb-8">View full league stats & top transfers</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {leagues.map((league) => (
              <Link
                key={league.id}
                href={`/leagues/${league.slug}`}
                className="p-5 border rounded-xl bg-white hover:border-blue-500 hover:shadow-md transition-all block group"
              >
                <div className="flex justify-between items-center">
                  <LeagueIdentity league={league} />
                  <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-full">
                    {league._count.clubs} Clubs
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transfers Activity Sidebar */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Latest Transfers</h2>
          {latestTransfers.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No transfer activity recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {latestTransfers.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-white border rounded-lg shadow-sm text-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <Link
                      href={`/players/${t.player.slug}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {t.player.name}
                    </Link>
                    <span className="font-bold text-green-700">
                      {t.fee
                        ? `€${t.fee.toLocaleString()}`
                        : t.transferType || "Free"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    {t.fromClub ? (
                      <Link
                        href={`/clubs/${t.fromClub.slug}`}
                        className="hover:underline font-medium text-slate-700"
                      >
                        {t.fromClub.name}
                      </Link>
                    ) : (
                      "Free Agent"
                    )}
                    <span>➔</span>
                    {t.toClub ? (
                      <Link
                        href={`/clubs/${t.toClub.slug}`}
                        className="hover:underline font-medium text-slate-700"
                      >
                        {t.toClub.name}
                      </Link>
                    ) : (
                      "Free Agent"
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
