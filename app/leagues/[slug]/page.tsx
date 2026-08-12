import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClubIdentity from "@/components/clubs/ClubIdentity";
import LeagueDetailAnalytics, {
  LeagueDetailAnalyticsSkeleton,
} from "@/components/leagues/LeagueDetailAnalytics";
import LeagueIdentity from "@/components/leagues/LeagueIdentity";
import { createPageMetadata } from "@/lib/seo/metadata";
import SectionNav from "@/components/navigation/SectionNav";

interface LeaguePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LeaguePageProps): Promise<Metadata> {
  const { slug } = await params;
  const league = await prisma.league.findUnique({
    where: { slug },
    select: { name: true, country: true },
  });

  if (!league) {
    return { title: "League not found", robots: { index: false } };
  }

  return createPageMetadata({
    title: `${league.name} Transfers & Statistics`,
    description: `Explore ${league.name} clubs, transfers, spending, squad values and performance analytics${league.country ? ` in ${league.country}` : ""}.`,
    path: `/leagues/${slug}`,
  });
}

export default async function LeaguePage({
  params,
}: LeaguePageProps) {
  const { slug } = await params;

  const league = await prisma.league.findUnique({
    where: {
      slug,
    },
    include: {
      clubs: {
        orderBy: {
          name: "asc",
        },
        include: {
          _count: {
            select: {
              players: true,
              outgoingTransfers: true,
              incomingTransfers: true,
            },
          },
        },
      },
    },
  });

  if (!league) {
    notFound();
  }

  return (
    <main className="app-page page-stack">
      {/* Header */}
      <section id="overview" className="section-anchor">
        <LeagueIdentity league={league} h1 country imagePreload />
      </section>

      <SectionNav
        items={[
          { id: "overview", label: "Overview" },
          { id: "clubs", label: "Clubs" },
          { id: "latest-transfers", label: "Latest transfers" },
          { id: "finances", label: "Finances" },
          { id: "squads", label: "Squads" },
          { id: "availability", label: "Availability" },
        ]}
      />

      {/* Clubs */}
      <section id="clubs" className="section-anchor">
        <h2 className="section-title">Clubs</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {league.clubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.slug}`}
              className="card-link"
            >
              <ClubIdentity club={club} link={false} />
            </Link>
          ))}
        </div>
      </section>

      <Suspense fallback={<LeagueDetailAnalyticsSkeleton />}>
        <LeagueDetailAnalytics leagueId={league.id} leagueName={league.name} />
      </Suspense>
    </main>
  );
}
