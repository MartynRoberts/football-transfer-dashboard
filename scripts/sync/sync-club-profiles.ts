import { prisma } from "../../lib/prisma";
import { syncClubProfile } from "../../lib/sync/clubs";

export async function syncClubProfiles() {
  console.log("🛡 Syncing club profiles...");

  const clubs = await prisma.club.findMany({
    where: {
      transfermarktId: {
        not: null,
      },

      league: {
        transfermarktId: {
          in: ["GB1", "L1", "ES1", "IT1", "FR1"],
        },
      },
    },
  });

  console.log(`Found ${clubs.length} clubs`);

  for (const club of clubs) {
    try {
      await syncClubProfile(club.transfermarktId!);
    } catch (error) {
      console.error(`Failed ${club.name}`, error);
    }

    await new Promise((r) => setTimeout(r, 250));
  }

  console.log("✅ Club profiles synced");
}

if (require.main === module) {
  syncClubProfiles().finally(() => prisma.$disconnect());
}
