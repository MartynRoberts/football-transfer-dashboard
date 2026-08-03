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

  if (!data || !Array.isArray(data.injuries)) {
    return false;
  }

  const injuries = data.injuries
    .map((injury) => {
      const startDate = new Date(injury.fromDate);
      const description = injury.injury?.trim();

      if (!description || Number.isNaN(startDate.getTime())) {
        return null;
      }

      const expectedReturn = injury.untilDate
        ? new Date(injury.untilDate)
        : null;
      const validExpectedReturn =
        expectedReturn && !Number.isNaN(expectedReturn.getTime())
          ? expectedReturn
          : null;
      const id = `${playerId}-${startDate.toISOString()}-${description}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-");

      return {
        id,
        playerId,
        season: injury.season?.trim() || null,
        description,
        startDate,
        expectedReturn: validExpectedReturn,
        days: Number.isFinite(injury.days) ? injury.days : null,
        gamesMissed: Number.isFinite(injury.gamesMissed)
          ? injury.gamesMissed
          : null,
      };
    })
    .filter((injury): injury is NonNullable<typeof injury> => injury !== null);

  const uniqueInjuries = [
    ...new Map(injuries.map((injury) => [injury.id, injury])).values(),
  ];

  console.log(
    `  ↳ Importing ${uniqueInjuries.length}/${data.injuries.length} injuries`,
  );

  for (const injury of uniqueInjuries) {
    await prisma.injury.upsert({
      where: {
        id: injury.id,
      },

      update: {
        season: injury.season,
        description: injury.description,
        startDate: injury.startDate,
        expectedReturn: injury.expectedReturn,
        days: injury.days,
        gamesMissed: injury.gamesMissed,
      },

      create: injury,
    });
  }

  return true;
}
