import { prisma } from "../../lib/prisma";
import { normalizeRemoteImageUrl } from "../../lib/images/normalize-remote-image-url";
import { ApiHttpError, fetchFromApi } from "../../lib/sync/api";
import { getPositionGroup } from "../../lib/sync/helpers/position-group";
import { TOP_FIVE_LEAGUE_IDS } from "../../lib/sync/scope";
import type { Prisma } from "@prisma/client";

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
  const delayArgument = process.argv.find((value) =>
    value.startsWith("--delay-ms="),
  );
  const maxAgeArgument = process.argv.find((value) =>
    value.startsWith("--max-age-days="),
  );
  const delayMs = Number(delayArgument?.split("=")[1] ?? 7000);
  const maxAgeDays = Number(maxAgeArgument?.split("=")[1] ?? 7);

  if (!Number.isFinite(delayMs) || delayMs < 1000) {
    throw new Error("--delay-ms must be a number of at least 1000");
  }

  if (!Number.isFinite(maxAgeDays) || maxAgeDays <= 0) {
    throw new Error("--max-age-days must be a number greater than 0");
  }

  if (force) {
    console.log(
      "⚠️ Force mode enabled: refreshing all eligible player profiles",
    );
  }

  const freshnessCutoff = new Date(
    Date.now() - maxAgeDays * 24 * 60 * 60 * 1000,
  );
  const clubScope: Prisma.ClubNullableScalarRelationFilter = {
    is: {
      league: {
        is: {
          transfermarktId: {
            in: [...TOP_FIVE_LEAGUE_IDS],
          },
        },
      },
    },
  };

  if (!force) {
    const skippedCount = await prisma.player.count({
      where: {
        transfermarktId: {
          not: null,
        },
        currentClub: clubScope,
        profileSyncedAt: {
          gte: freshnessCutoff,
        },
      },
    });

    console.log(
      `Skipping ${skippedCount} profiles synced in the last ${maxAgeDays} days`,
    );
  }

  const players = await prisma.player.findMany({
    where: {
      transfermarktId: {
        not: null,
      },
      currentClub: clubScope,
      ...(force
        ? {}
        : {
            OR: [
              {
                profileSyncedAt: null,
              },
              {
                profileSyncedAt: {
                  lt: freshnessCutoff,
                },
              },
            ],
      }),
    },
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });

  console.log(`Found ${players.length} players`);

  let count = 0;

  for (const player of players) {
    count++;

    console.log(`[${count}/${players.length}] ${player.name}`);

    try {
      const profile = await fetchFromApi<PlayerProfileResponse>(
        `/players/${player.transfermarktId}/profile`,
        { throwOnHttpError: true },
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

      console.log(`✓ Saved ${player.name}`);
    } catch (error) {
      console.error(`Failed ${player.name}`, error);

      if (
        error instanceof ApiHttpError &&
        (error.status === 403 || error.status === 429)
      ) {
        console.error(
          `\n🛑 Upstream returned ${error.status}. Stopping to avoid extending ` +
            "the block. Successfully synced players will be skipped on the next run.",
        );
        break;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  console.log("✅ Player profiles synced");
}

if (require.main === module) {
  syncPlayerProfiles().finally(() => prisma.$disconnect());
}
