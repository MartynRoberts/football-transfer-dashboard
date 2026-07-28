// scripts/check-club-logos.ts

import { prisma } from "../lib/prisma";

async function main() {
  const clubs = await prisma.club.findMany({
    take: 20,
    select: {
      name: true,
      logoUrl: true,
    },
  });

  console.log(clubs);
}

main().finally(() => prisma.$disconnect());
