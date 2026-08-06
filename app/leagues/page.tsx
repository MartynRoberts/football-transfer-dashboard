import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LeagueIdentity from "@/components/leagues/LeagueIdentity";
import LeagueAnalytics, {
  LeagueAnalyticsSkeleton,
} from "@/components/leagues/LeagueAnalytics";

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
    <main className="app-page page-stack">
      <section>
        <h1 className="page-title mb-6">Leagues</h1>

        <div className="grid gap-4 md:grid-cols-2">
          {leagues.map((league) => (
            <Link
              key={league.id}
              href={`/leagues/${league.slug}`}
              className="card-link block"
            >
              <div className="flex items-center justify-between">
                <LeagueIdentity league={league} country imageSize={64} />
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {league._count.clubs} Clubs
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Suspense fallback={<LeagueAnalyticsSkeleton />}>
        <LeagueAnalytics />
      </Suspense>
    </main>
  );
}
