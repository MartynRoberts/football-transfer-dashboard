import { prisma } from "@/lib/prisma";
import { fetchFromApi } from "./api";
import { InjuryResponse } from "./types";

export async function syncPlayerInjuries(
  playerId: string,
  transfermarktId: string,
) {
  const data = await fetchFromApi<InjuryResponse>(
    `/players/${transfermarktId}/injuries`,
  );

  if (!data?.injuries?.length) {
    return;
  }

  console.log(`  ↳ Syncing ${data.injuries.length} injuries`);

  for (const injury of data.injuries) {
    const id = `${playerId}-${injury.fromDate}-${injury.injury}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");

    await prisma.injury.upsert({
      where: {
        id,
      },

      update: {
        description: injury.injury,
        startDate: new Date(injury.fromDate),
        expectedReturn: injury.untilDate ? new Date(injury.untilDate) : null,
      },

      create: {
        id,
        playerId,
        description: injury.injury,
        startDate: new Date(injury.fromDate),
        expectedReturn: injury.untilDate ? new Date(injury.untilDate) : null,
      },
    });
  }
}
