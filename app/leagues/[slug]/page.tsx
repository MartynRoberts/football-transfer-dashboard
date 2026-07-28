import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClubIdentity from "@/components/clubs/ClubIdentity";
import LeagueIdentity from "@/components/leagues/LeagueIdentity";

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
    <main className="container mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section>
        <LeagueIdentity league={league} h1={true} country={true} />

        <div className="mt-6 border rounded-lg p-4 inline-block">
          <p className="text-sm text-gray-500">Clubs</p>
          <p className="text-3xl font-bold">{league.clubs.length}</p>
        </div>
      </section>

      {/* Clubs */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Clubs</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {league.clubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.slug}`}
              className="border rounded-lg p-4 hover:border-blue-500 hover:shadow-sm"
            >
              <ClubIdentity club={club} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
