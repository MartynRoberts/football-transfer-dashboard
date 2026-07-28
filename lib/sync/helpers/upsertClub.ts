import { prisma } from "@/lib/prisma";

interface ClubInput {
  id: string;
  name: string;
}

export async function upsertClub(club: ClubInput) {
  const existing = await prisma.club.findUnique({
    where: {
      transfermarktId: club.id,
    },
  });

  if (existing) {
    return existing;
  }

  const slugBase = club.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return await prisma.club.create({
    data: {
      // Transfermarkt external ID
      transfermarktId: club.id,

      name: club.name,

      // Ensure uniqueness because academies/youth teams
      // can share similar names
      slug: `${slugBase}-${club.id}`,

      // Required by schema
      // Unknown clubs will be assigned here
      leagueId: "unknown",
    },
  });
}
