import { prisma } from "@/lib/prisma";
import { searchCompetition, getCompetitionClubs } from "@/lib/transfermarkt";

export default async function Home() {
  const leagues = await prisma.league.findMany();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Football Transfer Dashboard</h1>

      <ul>
        {leagues.map((league) => (
          <li key={league.id}>{league.name}</li>
        ))}
      </ul>
    </main>
  );
}
