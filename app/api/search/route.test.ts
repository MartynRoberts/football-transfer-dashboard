/** @jest-environment node */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    player: { findMany: jest.fn() },
    club: { findMany: jest.fn() },
    league: { findMany: jest.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { GET } from "./route";

describe("search API", () => {
  beforeEach(() => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.club.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.league.findMany as jest.Mock).mockResolvedValue([]);
  });

  it("returns no results without querying for fewer than two characters", async () => {
    const response = await GET({ nextUrl: new URL("http://localhost/api/search?q=a") } as never);
    expect(await response.json()).toEqual({ players: [], clubs: [], leagues: [] });
    expect(prisma.player.findMany).not.toHaveBeenCalled();
  });

  it("searches each category case-insensitively with a five-result limit", async () => {
    await GET({ nextUrl: new URL("http://localhost/api/search?q=%20villa%20") } as never);
    expect(prisma.player.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { name: { contains: "villa", mode: "insensitive" } },
      take: 5,
    }));
    expect(prisma.club.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.league.findMany).toHaveBeenCalledTimes(1);
  });
});
