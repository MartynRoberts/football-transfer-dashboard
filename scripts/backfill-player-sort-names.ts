import { prisma } from "../lib/prisma";

function splitPlayerName(name: string): {
  firstName: string | null;
  lastName: string;
  sortName: string;
} {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return {
      firstName: null,
      lastName: parts[0],
      sortName: parts[0],
    };
  }

  const lastName = parts.pop()!;
  const firstName = parts.join(" ");

  return {
    firstName,
    lastName,
    sortName: `${lastName}, ${firstName}`,
  };
}

async function main() {
  const players = await prisma.player.findMany({
    where: {
      OR: [{ sortName: null }, { firstName: null }, { lastName: null }],
    },

    select: {
      id: true,
      name: true,
    },
  });

  console.log(`Backfilling ${players.length} player names...`);

  let updated = 0;

  for (const player of players) {
    const parsedName = splitPlayerName(player.name);

    await prisma.player.update({
      where: {
        id: player.id,
      },

      data: {
        firstName: parsedName.firstName,
        lastName: parsedName.lastName,
        sortName: parsedName.sortName,
      },
    });

    updated++;

    if (updated % 100 === 0) {
      console.log(`Updated ${updated}/${players.length}`);
    }
  }

  console.log(`Finished. Updated ${updated} players.`);
}

main()
  .catch((error) => {
    console.error("Failed to backfill player names:", error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
