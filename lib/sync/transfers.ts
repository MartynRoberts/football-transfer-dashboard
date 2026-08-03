import { prisma } from "../prisma";
import { fetchFromApi } from "./api";
import slugify from "./helpers/slugify";
import { getTopFiveFirstTeamClubIds } from "./scope";
import { PlayerTransferResponse } from "./types";

function parseSeasonYears(seasonName: string): {
  startYear: number;
  endYear: number;
} {
  const parts = seasonName.split(/[/-]/);

  let startYear = Number.parseInt(parts[0], 10);
  let endYear = parts[1] ? Number.parseInt(parts[1], 10) : startYear + 1;

  // Convert seasons such as "23/24" to 2023 and 2024.
  if (startYear < 100) {
    startYear += 2000;
  }

  if (endYear < 100) {
    endYear += 2000;
  }

  return {
    startYear,
    endYear,
  };
}

export async function syncPlayerTransfers(
  playerId: string,
  tmPlayerId: string,
): Promise<boolean> {
  const data = await fetchFromApi<PlayerTransferResponse>(
    `/players/${tmPlayerId}/transfers`,
  );

  if (!data?.transfers) {
    return false;
  }

  const firstTeamClubIds = await getTopFiveFirstTeamClubIds();
  const qualifyingTransfers = data.transfers.filter(
    (transfer) =>
      (transfer.clubFrom?.id && firstTeamClubIds.has(transfer.clubFrom.id)) ||
      (transfer.clubTo?.id && firstTeamClubIds.has(transfer.clubTo.id)),
  );

  console.log(
    `  ↳ Importing ${qualifyingTransfers.length}/${data.transfers.length} ` +
      "transfers involving a top-five first team",
  );

  for (const transfer of qualifyingTransfers) {
    let fromClubId: string | null = null;
    let toClubId: string | null = null;
    let season: string | null = null;

    // 1. Upsert origin club.
    if (transfer.clubFrom?.id) {
      const fromClub = await prisma.club.upsert({
        where: {
          transfermarktId: transfer.clubFrom.id,
        },
        update: {
          name: transfer.clubFrom.name,
        },
        create: {
          id: `tm-${transfer.clubFrom.id}`,
          transfermarktId: transfer.clubFrom.id,
          name: transfer.clubFrom.name,
          slug: `${slugify(transfer.clubFrom.name)}-${transfer.clubFrom.id}`,
        },
      });

      fromClubId = fromClub.id;
    }

    // 2. Upsert destination club.
    if (transfer.clubTo?.id) {
      const toClub = await prisma.club.upsert({
        where: {
          transfermarktId: transfer.clubTo.id,
        },
        update: {
          name: transfer.clubTo.name,
        },
        create: {
          id: `tm-${transfer.clubTo.id}`,
          transfermarktId: transfer.clubTo.id,
          name: transfer.clubTo.name,
          slug: `${slugify(transfer.clubTo.name)}-${transfer.clubTo.id}`,
        },
      });

      toClubId = toClub.id;
    }

    // 3. Upsert season if provided.
    if (transfer.season) {
      const { startYear, endYear } = parseSeasonYears(transfer.season);

      const seasonRecord = await prisma.season.upsert({
        where: {
          name: transfer.season,
        },
        update: {
          startYear,
          endYear,
        },
        create: {
          id: transfer.season,
          name: transfer.season,
          startYear,
          endYear,
        },
      });

      season = seasonRecord.id;
    }

    // 4. Upsert transfer.
    await prisma.transfer.upsert({
      where: {
        transfermarktId: transfer.id,
      },
      update: {
        playerId,
        fromClubId,
        toClubId,
        season,
        fee: transfer.fee ?? null,
        marketValue: transfer.marketValue ?? null,
        upcoming: transfer.upcoming ?? false,
        transferDate: transfer.date ? new Date(transfer.date) : null,
        transferType: transfer.transferType ?? null,
      },
      create: {
        transfermarktId: transfer.id,
        playerId,
        fromClubId,
        toClubId,
        season,
        fee: transfer.fee ?? null,
        marketValue: transfer.marketValue ?? null,
        upcoming: transfer.upcoming ?? false,
        transferDate: transfer.date ? new Date(transfer.date) : null,
        transferType: transfer.transferType ?? null,
      },
    });
  }

  return true;
}

export const syncTransfers = syncPlayerTransfers;
