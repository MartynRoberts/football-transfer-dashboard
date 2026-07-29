// lib/sync/transfers.ts
import { prisma } from "../prisma";
import { fetchFromApi } from "./api";
import slugify from "./helpers/slugify";
import { PlayerTransferResponse } from "./types";

export async function syncPlayerTransfers(
  playerId: string,
  tmPlayerId: string,
) {
  const data = await fetchFromApi<PlayerTransferResponse>(
    `/players/${tmPlayerId}/transfers`,
  );
  if (!data || !data.transfers) return false;

  for (const t of data.transfers) {
    let fromClubId: string | null = null;
    let toClubId: string | null = null;
    let season: string | null = null;

    // 1. Upsert Origin Club
    if (t.clubFrom?.id) {
      const fromClub = await prisma.club.upsert({
        where: { transfermarktId: t.clubFrom.id },
        update: { name: t.clubFrom.name },
        create: {
          id: `tm-${t.clubFrom.id}`,
          transfermarktId: t.clubFrom.id,
          name: t.clubFrom.name,
          slug: `${slugify(t.clubFrom.name)}-${t.clubFrom.id}`,
        },
      });

      fromClubId = fromClub.id;
    }

    // 2. Upsert Destination Club
    if (t.clubTo?.id) {
      const toClub = await prisma.club.upsert({
        where: { transfermarktId: t.clubTo.id },
        update: { name: t.clubTo.name },
        create: {
          id: `tm-${t.clubTo.id}`,
          transfermarktId: t.clubTo.id,
          name: t.clubTo.name,
          slug: `${slugify(t.clubTo.name)}-${t.clubTo.id}`,
        },
      });
      toClubId = toClub.id;
    }

    // 3. Upsert Season if provided
    function parseSeasonYears(seasonName: string): {
      startYear: number;
      endYear: number;
    } {
      const parts = seasonName.split(/[\/-]/);
      let start = parseInt(parts[0], 10);
      let end = parts[1] ? parseInt(parts[1], 10) : start + 1;

      // Handle 2-digit years like "23/24" -> 2023 / 2024
      if (start < 100) start += 2000;
      if (end < 100) end += 2000;

      return { startYear: start, endYear: end };
    }

    if (t.season) {
      const { startYear, endYear } = parseSeasonYears(t.season);

      const season = await prisma.season.upsert({
        where: { name: t.season },
        update: {},
        create: {
          id: t.season, // Passing id as required
          name: t.season,
          startYear,
          endYear,
        },
      });
      season = season.id;
    }

    // 4. Upsert Transfer (Idempotent)
    await prisma.transfer.upsert({
      where: { transfermarktId: t.id },
      update: {
        fromClubId,
        toClubId,
        season,
        fee: t.fee ?? null,
        marketValue: t.marketValue ?? null,
        upcoming: t.upcoming ?? false,
        transferDate: t.date ? new Date(t.date) : null,
      },
      create: {
        transfermarktId: t.id,
        playerId,
        fromClubId,
        toClubId,
        season,
        fee: t.fee ?? null,
        marketValue: t.marketValue ?? null,
        upcoming: t.upcoming ?? false,
        transferDate: t.date ? new Date(t.date) : null,
      },
    });
  }

  return true;
}

export const syncTransfers = syncPlayerTransfers;
