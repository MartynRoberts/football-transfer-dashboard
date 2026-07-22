import { prisma } from "@/lib/prisma";

export async function GET() {
  const startedAt = new Date();

  const syncLog = await prisma.syncLog.create({
    data: {
      type: "transfers",
      status: "running",
      startedAt,
    },
  });

  try {
    /*
      TODO:
      Replace this with the Transfermarkt sync service.

      Example:

      const result = await syncTransfers();

      For now we just prove the pipeline works.
    */

    const recordsImported = 0;

    await prisma.syncLog.update({
      where: {
        id: syncLog.id,
      },
      data: {
        status: "completed",
        records: recordsImported,
        completedAt: new Date(),
      },
    });

    return Response.json({
      success: true,
      syncId: syncLog.id,
      recordsImported,
    });
  } catch (error) {
    await prisma.syncLog.update({
      where: {
        id: syncLog.id,
      },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      },
    });

    return Response.json(
      {
        success: false,
        error: "Transfer sync failed",
      },
      {
        status: 500,
      },
    );
  }
}
