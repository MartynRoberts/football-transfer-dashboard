import { prisma } from "../lib/prisma";
import { fetchFromApi } from "../lib/sync/api";
import { syncPlayerTransfers } from "../lib/sync/transfers";
import { syncPlayerProfile } from "../lib/sync/players";
import { syncPlayerInjuries } from "../lib/sync/injuries";
import { syncPlayerMarketValue } from "../lib/sync/market-values";
import { syncClubProfile } from "../lib/sync/clubs";
import { ClubPlayersResponse } from "../lib/sync/types";
import { syncPlayerStats } from "../lib/sync/stats";
import { getPositionGroup } from "../lib/sync/helpers/position-group";
import slugify from "../lib/sync/helpers/slugify";

const TARGET_CLUB_ALIASES = [
  ["Arsenal"],
  ["Liverpool"],
  ["Manchester City", "Man City"],
  ["Real Madrid"],
  ["Barcelona", "FC Barcelona"],
  ["Bayern", "Bayern München", "Bayern Munich"],
  ["Paris Saint-Germain", "PSG", "Paris SG"],
  ["Inter Milan", "Internazionale", "FC Internazionale"],
  ["Juventus"],
];

const syncedPlayers = new Set<string>();

let clubsProcessed = 0;
let playersProcessed = 0;
let playersEnriched = 0;

function isTargetClub(name: string) {
  const normalised = name.toLowerCase();

  return TARGET_CLUB_ALIASES.some((aliases) =>
    aliases.some((alias) => normalised.includes(alias.toLowerCase())),
  );
}

async function delay(ms: number) {
  // Add a delay to avoid hammering the API
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 1. Sync all players for a specific club from Transfermarkt
async function syncClubSquad(tmClubId: string, leagueId?: string) {
  console.log(`\nFetching squad for Club TM ID: ${tmClubId}...`);

  // Fetch squad/players endpoint from local/remote API
  const data = await fetchFromApi<ClubPlayersResponse>(
    `/clubs/${tmClubId}/players`,
  );
  if (!data || !data.players) {
    console.warn(`  ⚠️ Could not fetch players for club TM ID: ${tmClubId}`);
    return;
  }

  // Fallback for club name
  const clubName =
    data.name ||
    (
      await prisma.club.findUnique({
        where: {
          transfermarktId: data.id,
        },
        select: {
          name: true,
        },
      })
    )?.name ||
    `Club ${data.id}`;

  // Upsert the Club
  const club = await prisma.club.upsert({
    where: { transfermarktId: data.id },
    update: { name: clubName },
    create: {
      id: `tm-${data.id}`,
      transfermarktId: data.id,
      name: clubName,
      slug: `${slugify(clubName)}-${data.id}`,
      leagueId: leagueId ?? undefined,
    },
  });

  try {
    await syncClubProfile(club.transfermarktId!);
    await delay(250);
  } catch (err) {
    console.warn(`Failed club profile sync for ${club.name}`);
  }
  await delay(250);

  console.log(`  ✓ Syncing ${data.players.length} players for ${club.name}...`);

  let playerCount = 0;

  // Upsert each player into Prisma
  for (const p of data.players) {
    if (syncedPlayers.has(p.id)) {
      console.log(`Skipping duplicate player: ${p.name}`);
      continue;
    }

    syncedPlayers.add(p.id);

    const alreadySynced = syncedPlayers.has(p.id);

    playerCount++;

    console.log(
      `[${playerCount}/${data.players.length}] ${alreadySynced ? "Updating" : "Syncing"} ${p.name}`,
    );

    const player = await prisma.player.upsert({
      where: {
        transfermarktId: p.id,
      },

      update: {
        name: p.name,
        position: p.position,
        positionGroup: getPositionGroup(p.position),
        currentClubId: club.id,
      },

      create: {
        id: p.id,
        transfermarktId: p.id,
        name: p.name,
        slug: `${slugify(p.name)}-${p.id}`,
        position: p.position,
        positionGroup: getPositionGroup(p.position),
        currentClubId: club.id,
      },
    });

    playersProcessed++;

    if (alreadySynced) {
      continue;
    }

    syncedPlayers.add(p.id);
    playersEnriched++;

    if (player.transfermarktId) {
      try {
        await syncPlayerProfile(player.id, player.transfermarktId);
        await delay(250);
        await syncPlayerTransfers(player.id, player.transfermarktId);
        await delay(250);
        await syncPlayerMarketValue(player.id, player.transfermarktId);
        await delay(250);
        await syncPlayerStats(player.id, player.transfermarktId);
        await delay(250);
      } catch (err) {
        console.error(`Failed syncing ${player.name}`, err);
      }

      try {
        await syncPlayerInjuries(player.id, player.transfermarktId);
        await delay(250);
      } catch (err) {
        console.warn(`No injuries synced for ${player.name}`);
      }
    }
  }
}

// 2. Master Sync Function
async function main() {
  console.log("🚀 Starting Full Football Data Sync Pipeline...\n");

  const allClubs = await prisma.club.findMany({
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
  });

  const targetClubs = allClubs.filter((club) => isTargetClub(club.name));

  console.log(`Found ${targetClubs.length}/${allClubs.length} target clubs`);

  for (const club of targetClubs) {
    await syncClubSquad(club.transfermarktId!, club.leagueId ?? undefined);
    clubsProcessed++;
  }

  console.log(`
  ✅ Pipeline complete!

  Clubs processed: ${clubsProcessed}
  Players processed: ${playersProcessed}
  Players enriched: ${playersEnriched}
  Unique players synced: ${syncedPlayers.size}
  `);
}

main()
  .catch((e) => {
    console.error("Fatal error during sync:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
