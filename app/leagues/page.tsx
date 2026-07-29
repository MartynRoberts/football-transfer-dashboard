import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LeagueIdentity from "@/components/leagues/LeagueIdentity";

export const revalidate = 60;

export default async function LeaguesPage() {
  const leagues = await prisma.league.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          clubs: true,
        },
      },
    },
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Leagues</h1>

      <div className="grid md:grid-cols-2 gap-4">
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
    </main>
  );
}
