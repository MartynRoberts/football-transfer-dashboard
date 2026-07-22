import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ClubPage({ params }: Props) {
  const { slug } = await params;

  const club = await prisma.club.findFirst({
    where: {
      slug,
    },
    include: {
      league: true,
      players: true,
    },
  });

  if (!club) {
    notFound();
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">{club.name}</h1>

      <p className="text-gray-500 mb-8">{club.league.name}</p>

      <h2 className="text-2xl font-semibold mb-4">Squad</h2>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="text-left p-2">Player</th>
            <th className="text-left p-2">Position</th>
          </tr>
        </thead>

        <tbody>
          {club.players.map((player) => (
            <tr key={player.id}>
              <td className="p-2">{player.name}</td>

              <td className="p-2">{player.position}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
