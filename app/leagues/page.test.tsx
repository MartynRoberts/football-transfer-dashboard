import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";

jest.mock("@/lib/prisma", () => ({ prisma: { league: { findMany: jest.fn() } } }));
jest.mock("@/components/leagues/LeagueAnalytics", () => ({
  __esModule: true,
  default: () => <div id="league-finances">Analytics</div>,
  LeagueAnalyticsSkeleton: () => <div>Loading analytics</div>,
}));

import LeaguesPage from "./page";
import { prisma } from "@/lib/prisma";

const findMany = prisma.league.findMany as jest.Mock;

describe("LeaguesPage", () => {
  beforeEach(() => {
    findMany.mockResolvedValue([
      {
        id: "league-1",
        name: "Premier League",
        slug: "premier-league",
        country: "England",
        transfermarktId: "GB1",
        _count: { clubs: 20 },
      },
    ]);
  });

  it("renders league data, counts, and matching sub-navigation", async () => {
    render(await LeaguesPage());
    expect(screen.getByRole("heading", { level: 1, name: "Leagues" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Premier League/ })).toHaveAttribute("href", "/leagues/premier-league");
    expect(screen.getByText("20 Clubs")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "On this page" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Finances" })).toHaveAttribute("href", "#league-finances");
  });

  it("has no basic accessibility violations", async () => {
    const { container } = render(await LeaguesPage());
    expect(await axe(container)).toHaveNoViolations();
  });
});
