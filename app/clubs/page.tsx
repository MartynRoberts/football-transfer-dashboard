import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ClubsPage() {
  const clubs = await prisma.club.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Clubs</h1>

      <ul>
        {clubs.map((club) => (
          <li key={club.id}>
            <Link href={`/clubs/${club.slug}`}>{club.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
