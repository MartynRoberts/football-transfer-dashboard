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
    <main className="app-page page-stack">
      {/* Header */}
      <section>
        <LeagueIdentity league={league} h1 country imagePreload />

        <div className="analytics-panel mt-6 inline-block">
          <p className="text-sm text-gray-500">Clubs</p>
          <p className="text-3xl font-bold">{league.clubs.length}</p>
        </div>
      </section>

      {/* Clubs */}
      <section>
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
    </main>
  );
}
