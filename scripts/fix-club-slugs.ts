import { prisma } from "../lib/prisma";
import slugify from "../lib/sync/helpers/slugify";

async function main() {
  const clubs = await prisma.club.findMany();

  for (const club of clubs) {
    const slug = `${slugify(club.name)}-${club.transfermarktId}`;

    await prisma.club.update({
      where: {
        id: club.id,
      },
      data: {
        slug,
      },
    });

    console.log(`${club.name} -> ${slug}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
