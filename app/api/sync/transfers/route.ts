import { syncTransfers } from "@/lib/sync/transfers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await syncTransfers();

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Transfer sync failed",
      },
      {
        status: 500,
      },
    );
  }
}
