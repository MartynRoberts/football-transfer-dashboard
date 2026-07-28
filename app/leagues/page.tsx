import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
            className="border rounded-lg p-5 hover:border-blue-500"
          >
            <h2 className="font-bold text-lg">{league.name}</h2>

            <p className="text-sm text-slate-500">
              {league._count.clubs} clubs
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
