import { prisma } from "@/lib/prisma";

export async function syncTransfers() {
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
      Next step:
      Replace this with Transfermarkt API calls.
    */

    const imported = 0;

    await prisma.syncLog.update({
      where: {
        id: syncLog.id,
      },
      data: {
        status: "completed",
        recordsCreated: imported,
        recordsUpdated: 0,
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      imported,
      timestamp: new Date(),
    };
  } catch (error) {
    await prisma.syncLog.update({
      where: {
        id: syncLog.id,
      },
      data: {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      },
    });

    throw error;
  }
}
