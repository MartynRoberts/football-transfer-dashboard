import Link from "next/link";
import ClubName from "@/components/clubs/ClubName";
import { prisma } from "@/lib/prisma";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
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
      take: 20,
    }),

    prisma.club.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      take: 20,
    }),

    prisma.league.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
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

        <div className="grid gap-3">
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/players/${player.slug}`}
              className="card-link"
            >
              {player.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Clubs ({clubs.length})</h2>

        <div className="grid gap-3">
          {clubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.slug}`}
              className="card-link"
            >
              <ClubName club={club} size={24} />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Leagues ({leagues.length})</h2>

        <div className="grid gap-3">
          {leagues.map((league) => (
            <Link
              key={league.id}
              href={`/leagues/${league.slug}`}
              className="card-link"
            >
              {league.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
