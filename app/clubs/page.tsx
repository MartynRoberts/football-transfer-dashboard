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
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Clubs</h1>

      <div className="grid gap-4">
        {clubs.map((club) => (
          <Link
            key={club.id}
            href={`/clubs/${club.slug}`}
            className="border rounded p-4 hover:bg-gray-50"
          >
            <ClubIdentity club={club} />
          </Link>
        ))}
      </div>
    </main>
  );
}
