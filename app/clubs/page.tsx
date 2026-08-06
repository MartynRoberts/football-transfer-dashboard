import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ClubIdentity from "@/components/clubs/ClubIdentity";

export default async function ClubsPage() {
  const clubs = await prisma.club.findMany({
    where: {
      league: {
        transfermarktId: {
          in: ["GB1", "L1", "ES1", "IT1", "FR1"],
        },
      },
    },
    orderBy: {
      name: "asc",
    },
    include: {
      league: true,
      _count: {
        select: {
          players: true,
        },
      },
    },
  });

  return (
    <main className="app-page">
      <h1 className="page-title mb-6">Clubs</h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clubs.map((club) => (
          <Link
            key={club.id}
            href={`/clubs/${club.slug}`}
            className="card-link"
          >
            <ClubIdentity club={club} link={false} />
          </Link>
        ))}
      </div>
    </main>
  );
}
