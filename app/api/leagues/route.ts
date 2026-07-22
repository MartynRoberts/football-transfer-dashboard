import { prisma } from "@/lib/prisma";

export async function GET() {
  const leagues = await prisma.league.findMany();

  return Response.json(leagues);
}
