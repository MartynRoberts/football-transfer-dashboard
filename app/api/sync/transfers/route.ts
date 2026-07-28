// app/api/sync/transfers/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncPlayerTransfers } from "@/lib/sync/transfers";

export async function POST() {
  try {
    const players = await prisma.player.findMany({
      select: { id: true, name: true, transfermarktId: true },
    });

    if (players.length === 0) {
      return NextResponse.json(
        {
          message: "No players found in database to sync.",
          successCount: 0,
          failCount: 0,
        },
        { status: 200 },
      );
    }

    let successCount = 0;
    let failCount = 0;

    for (const player of players) {
      // Skip players without a valid Transfermarkt ID
      if (!player.transfermarktId) {
        console.warn(`Skipping ${player.name}: Missing transfermarktId`);
        failCount++;
        continue;
      }

      try {
        const ok = await syncPlayerTransfers(player.id, player.transfermarktId);
        if (ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
        console.error(`Error syncing ${player.name}:`, err);
      }
    }

    return NextResponse.json({
      message: "Sync finished",
      successCount,
      failCount,
    });
  } catch (error) {
    console.error("Fatal error during sync route execution:", error);
    return NextResponse.json(
      { error: "Internal Server Error during transfer sync" },
      { status: 500 },
    );
  }
}
