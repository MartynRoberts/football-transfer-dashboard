import { syncTransfers } from "@/lib/sync/transfers";

export async function GET() {
  const result = await syncTransfers();

  return Response.json(result);
}
