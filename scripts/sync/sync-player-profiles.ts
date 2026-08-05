import { prisma } from "../../lib/prisma";
import { normalizeRemoteImageUrl } from "../../lib/images/normalize-remote-image-url";
import { fetchFromApi } from "../../lib/sync/api";
import { getPositionGroup } from "../../lib/sync/helpers/position-group";
import { TOP_FIVE_LEAGUE_IDS } from "../../lib/sync/scope";

interface PlayerProfileResponse {
  id: string;

  name: string;

  imageUrl?: string;

  height?: number;

  dateOfBirth?: string;

  citizenship?: string[];

  position?: {
    main?: string;
    other?: string[];
  };

  foot?: string;

  shirtNumber?: string;

  club?: {
    id: string;
    name: string;
    joined?: string;
    contractExpires?: string;
  };
}

function parseShirtNumber(value?: string) {
  if (!value) return null;

  const number = value.replace("#", "");

  const parsed = Number(number);

  return isNaN(parsed) ? null : parsed;
}

function parseDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);

  return isNaN(date.getTime()) ? null : date;
}

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

export async function syncPlayerProfiles() {
  console.log("👤 Syncing player profiles");

  const force = process.argv.includes("--force");

  if (force) {
    console.log(
      "⚠️ Force mode enabled: refreshing all eligible player profiles",
    );
  }

  const players = await prisma.player.findMany({
    where: {
      transfermarktId: {
        not: null,
      },
      currentClub: {
        is: {
          league: {
            is: {
              transfermarktId: {
                in: [...TOP_FIVE_LEAGUE_IDS],
              },
            },
          },
        },
      },
      ...(force
        ? {}
        : {
            OR: [
              {
                profileSyncedAt: null,
              },
              {
                profileSyncedAt: {
                  lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              },
            ],
          }),
    },
  });

  console.log(`Found ${players.length} players`);

  let count = 0;

  for (const player of players) {
    count++;

    console.log(`[${count}/${players.length}] ${player.name}`);

    try {
      const profile = await fetchFromApi<PlayerProfileResponse>(
        `/players/${player.transfermarktId}/profile`,
      );

      if (!profile) {
        continue;
      }

      const secondaryPositions = Array.isArray(profile.position?.other)
        ? profile.position.other.filter(
            (position): position is string => typeof position === "string",
          )
        : typeof profile.position?.other === "string"
          ? [profile.position.other]
          : [];

      const parsedName = splitPlayerName(profile.name || player.name);

      await prisma.player.update({
        where: {
          id: player.id,
        },

        data: {
          name: profile.name || player.name,

          firstName: parsedName.firstName,
          lastName: parsedName.lastName,
          sortName: parsedName.sortName,

          imageUrl: profile.imageUrl
            ? normalizeRemoteImageUrl(profile.imageUrl)
            : undefined,

          height: profile.height ?? undefined,

          dateOfBirth: profile.dateOfBirth
            ? parseDate(profile.dateOfBirth)
            : undefined,

          nationality: profile.citizenship?.[0] ?? undefined,

          position: profile.position?.main ?? undefined,

          positionGroup: getPositionGroup(profile.position?.main),

          secondaryPositions,

          foot: profile.foot ?? undefined,

          shirtNumber: parseShirtNumber(profile.shirtNumber),

          joinedOn: parseDate(profile.club?.joined),

          contract: parseDate(profile.club?.contractExpires),

          profileSyncedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`Failed ${player.name}`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  console.log("✅ Player profiles synced");
}

if (require.main === module) {
  syncPlayerProfiles().finally(() => prisma.$disconnect());
}
