import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  if (!q) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Search</h1>
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
    <main className="container mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Search Results</h1>

        <p className="text-slate-500 mt-2">Results for "{q}"</p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4">Players ({players.length})</h2>

        <div className="grid gap-3">
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/players/${player.slug}`}
              className="border rounded-lg p-4 hover:border-blue-500"
            >
              {player.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Clubs ({clubs.length})</h2>

        <div className="grid gap-3">
          {clubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.slug}`}
              className="border rounded-lg p-4 hover:border-blue-500"
            >
              {club.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Leagues ({leagues.length})</h2>

        <div className="grid gap-3">
          {leagues.map((league) => (
            <Link
              key={league.id}
              href={`/leagues/${league.slug}`}
              className="border rounded-lg p-4 hover:border-blue-500"
            >
              {league.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
