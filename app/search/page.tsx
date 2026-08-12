import Link from "next/link";
import type { Metadata } from "next";
import SearchResultCard from "@/components/search/SearchResultCard";
import { prisma } from "@/lib/prisma";
import { createPageMetadata } from "@/lib/seo/metadata";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q = "" } = await searchParams;
  const title = q ? `Search results for “${q}”` : "Search";

  return createPageMetadata({
    title,
    description: q
      ? `Search results for ${q} across football players, clubs and leagues.`
      : "Search football players, clubs and leagues.",
    path: "/search",
    noIndex: true,
  });
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const { q = "" } = await searchParams;

  if (!q) {
    return (
      <main className="app-page">
        <h1 className="page-title">Search</h1>
        <p className="text-slate-500 mt-2">
          Search for players, clubs or leagues.
        </p>
      </main>
    );
  }

  const [players, clubs, leagues] = await Promise.all([
    prisma.player.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        position: true,
        imageUrl: true,
      },
      orderBy: { name: "asc" },
      take: 20,
    }),

    prisma.club.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      select: { id: true, name: true, slug: true, logoUrl: true },
      orderBy: { name: "asc" },
      take: 20,
    }),

    prisma.league.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        transfermarktId: true,
      },
      orderBy: { name: "asc" },
      take: 20,
    }),
  ]);

  return (
    <main className="app-page page-stack">
      <div>
        <h1 className="page-title">Search Results</h1>

        <p className="mt-2 text-slate-500">Results for &ldquo;{q}&rdquo;</p>
      </div>

      <section>
        <h2 className="section-title">Players ({players.length})</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/players/${player.slug}`}
              className="card-link"
            >
              <SearchResultCard
                result={{
                  ...player,
                  type: "player",
                  detail: player.position,
                }}
              />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Clubs ({clubs.length})</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {clubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.slug}`}
              className="card-link"
            >
              <SearchResultCard result={{ ...club, type: "club" }} />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Leagues ({leagues.length})</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {leagues.map((league) => (
            <Link
              key={league.id}
              href={`/leagues/${league.slug}`}
              className="card-link"
            >
              <SearchResultCard
                result={{
                  ...league,
                  type: "league",
                  detail: league.country,
                }}
              />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
