import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ players: [], clubs: [], leagues: [] });
  }

  const [players, clubs, leagues] = await Promise.all([
    prisma.player.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      select: { id: true, name: true, slug: true, position: true, imageUrl: true },
      orderBy: { name: "asc" },
      take: 5,
    }),
    prisma.club.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      select: { id: true, name: true, slug: true, logoUrl: true },
      orderBy: { name: "asc" },
      take: 5,
    }),
    prisma.league.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        transfermarktId: true,
      },
      orderBy: { name: "asc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({ players, clubs, leagues });
}
