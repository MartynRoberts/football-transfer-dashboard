import { render, screen } from "@testing-library/react";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    player: { findMany: jest.fn() },
    club: { findMany: jest.fn() },
    league: { findMany: jest.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import SearchPage from "./page";

describe("SearchPage", () => {
  it("renders the same image cards for all result types", async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue([
      { id: "p1", name: "Harry Kane", slug: "harry-kane-1", position: "Centre-Forward", imageUrl: "https://example.com/kane.png" },
    ]);
    (prisma.club.findMany as jest.Mock).mockResolvedValue([
      { id: "c1", name: "Aston Villa", slug: "aston-villa-405", logoUrl: "https://tmssl.akamaized.net/images/405.png" },
    ]);
    (prisma.league.findMany as jest.Mock).mockResolvedValue([
      { id: "l1", name: "Premier League", slug: "premier-league", country: "England", transfermarktId: "GB1" },
    ]);

    render(await SearchPage({ searchParams: Promise.resolve({ q: "a" }) }));

    expect(screen.getByRole("link", { name: /Harry Kane/ })).toHaveAttribute("href", "/players/harry-kane-1");
    expect(screen.getByRole("img", { name: "Harry Kane profile" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Aston Villa badge" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Premier League logo" })).toBeInTheDocument();
  });

  it("does not query the database when no search term is provided", async () => {
    jest.clearAllMocks();
    render(await SearchPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { name: "Search" })).toBeInTheDocument();
    expect(prisma.player.findMany).not.toHaveBeenCalled();
  });
});
