import { prisma } from "../lib/prisma";
import slugify from "@/lib/sync/helpers/slugify";

async function main() {
  console.log("Generating slugs for Clubs...");
  const clubs = await prisma.club.findMany();

  for (const club of clubs) {
    const slug = `${slugify(club.name)}-${club.id}`;
    await prisma.club.update({
      where: { id: club.id },
      data: { slug },
    });
  }

  console.log("Generating slugs for Players...");
  const players = await prisma.player.findMany();

  for (const player of players) {
    const slug = `${slugify(player.name)}-${player.id.slice(-5)}`;

    await prisma.player.update({
      where: { id: player.id },
      data: { slug },
    });
  }

  console.log("Slugs generated successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
