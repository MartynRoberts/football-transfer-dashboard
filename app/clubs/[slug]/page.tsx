import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ClubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const club = await prisma.club.findUnique({
    where: { slug },
    include: {
      league: true,
    },
  });

  if (!club) {
    notFound();
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">{club.name}</h1>

      <p>{club.league.name}</p>
    </main>
  );
}
