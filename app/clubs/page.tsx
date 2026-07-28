import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ClubsPage() {
  const clubs = await prisma.club.findMany({
    include: {
      league: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Clubs</h1>

      <div className="grid gap-4">
        {clubs.map((club) => (
          <Link
            key={club.id}
            href={`/clubs/${club.slug}`}
            className="border rounded p-4 hover:bg-gray-50"
          >
            <h2 className="font-semibold">{club.name}</h2>

            <p className="text-sm text-gray-500">
              {club.league?.name ?? "Unspecified League"}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
