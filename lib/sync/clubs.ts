import { prisma } from "@/lib/prisma";
import { fetchFromApi } from "@/lib/sync/api";
import { normalizeRemoteImageUrl } from "@/lib/images/normalize-remote-image-url";

import { ClubProfileResponse } from "./types";

export async function syncClubProfile(clubId: string) {
  const profile = await fetchFromApi<ClubProfileResponse>(
    `/clubs/${clubId}/profile`,
  );

  if (!profile) {
    console.warn(`No profile found for club ${clubId}`);
    return;
  }

  await prisma.club.update({
    where: {
      transfermarktId: clubId,
    },
    data: {
      logoUrl: profile.image ? normalizeRemoteImageUrl(profile.image) : null,
    },
  });

  console.log(`  ✓ Updated logo for ${profile.name}`);
}
