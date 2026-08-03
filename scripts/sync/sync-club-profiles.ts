import { prisma } from "../../lib/prisma";
import { syncClubProfile } from "../../lib/sync/clubs";
import { TOP_FIVE_LEAGUE_IDS } from "../../lib/sync/scope";

export async function syncClubProfiles() {
  console.log("🛡 Syncing club profiles...");

  const clubs = await prisma.club.findMany({
    where: {
      transfermarktId: {
        not: null,
      },

      league: {
        transfermarktId: {
          in: [...TOP_FIVE_LEAGUE_IDS],
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
