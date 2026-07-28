import { prisma } from "./lib/prisma";

async function main() {
  const clubs = await prisma.club.findMany({
    select: {
      name: true,
      transfermarktId: true,
      id: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const grouped = clubs.reduce(
    (acc, club) => {
      if (!club.transfermarktId) return acc;

      if (!acc[club.transfermarktId]) {
        acc[club.transfermarktId] = [];
      }

      acc[club.transfermarktId].push(club);

      return acc;
    },
    {} as Record<string, typeof clubs>,
  );

  const duplicates = Object.entries(grouped).filter(
    ([_, values]) => values.length > 1,
  );

  console.log(JSON.stringify(duplicates, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
