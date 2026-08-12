import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LeagueIdentity from "@/components/leagues/LeagueIdentity";
import LeagueAnalytics, {
  LeagueAnalyticsSkeleton,
} from "@/components/leagues/LeagueAnalytics";
import { createPageMetadata } from "@/lib/seo/metadata";
import SectionNav from "@/components/navigation/SectionNav";

export const metadata = createPageMetadata({
  title: "Football Leagues",
  description:
    "Compare transfer spending, squad values and performance analytics across Europe's leading football leagues.",
  path: "/leagues",
});

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
    <main className="app-page page-stack min-w-0 overflow-x-clip">
      <div id="leagues" className="section-anchor">
        <h1 className="page-title">Leagues</h1>
      </div>

      <SectionNav
        items={[
          { id: "leagues", label: "Leagues" },
          { id: "league-finances", label: "Finances" },
          { id: "league-squads", label: "Squads" },
          { id: "league-injuries", label: "Injuries" },
          { id: "league-discipline", label: "Discipline" },
        ]}
      />

      <section>
        <div className="grid gap-4 md:grid-cols-2">
          {leagues.map((league) => (
            <Link
              key={league.id}
              href={`/leagues/${league.slug}`}
              className="card-link block"
            >
              <div className="flex items-center justify-between">
                <LeagueIdentity
                  league={league}
                  country
                  imageSize={64}
                  headingLevel={2}
                />
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
