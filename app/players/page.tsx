import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function PlayersPage() {
  const players = await prisma.player.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      currentClub: true,
    },
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Players</h1>

      <div className="grid md:grid-cols-3 gap-4">
        {players.map((player) => (
          <Link
            key={player.id}
            href={`/players/${player.slug}`}
            className="border rounded-lg p-4 hover:border-blue-500"
          >
            <h2 className="font-bold">{player.name}</h2>

            <p className="text-sm text-slate-500">{player.currentClub?.name}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
