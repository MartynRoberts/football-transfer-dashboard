import { syncPlayers } from "@/lib/sync/players";

export async function GET() {
  const result = await syncPlayers();

  return Response.json(result);
}
