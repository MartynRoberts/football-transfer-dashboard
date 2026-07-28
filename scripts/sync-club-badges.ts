import { prisma } from "../lib/prisma";
import { syncClubProfile } from "../lib/sync/clubs";

async function main() {
  const clubs = await prisma.club.findMany({
    where: {
      league: {
        transfermarktId: {
          in: ["GB1", "L1", "ES1", "IT1", "FR1"],
        },
      },
      transfermarktId: {
        not: null,
      },
    },
    select: {
      name: true,
      transfermarktId: true,
    },
  });

  console.log(`Found ${clubs.length} clubs`);

  let count = 0;

  for (const club of clubs) {
    count++;

    console.log(`[${count}/${clubs.length}] Syncing badge for ${club.name}`);

    await syncClubProfile(club.transfermarktId!);

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  console.log("✅ Badge sync complete");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
