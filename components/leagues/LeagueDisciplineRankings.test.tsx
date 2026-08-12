import { render, screen } from "@testing-library/react";
import LeagueDisciplineRankings from "@/components/leagues/LeagueDisciplineRankings";

const clubs = Array.from({ length: 7 }, (_, index) => ({
  id: `${index}`,
  name: `Club ${index}`,
  slug: `club-${index}`,
  logoUrl: null,
  leagueName: "Premier League",
  yellowCards: 10 + index,
  redCards: index,
  matchesCovered: 10,
  cardsPerMatch: 1 + index / 10,
}));

describe("LeagueDisciplineRankings", () => {
  it("shows the five best and five worst clubs", () => {
    render(<LeagueDisciplineRankings clubs={clubs} season="25/26" />);
    expect(
      screen.getByRole("heading", { name: "Most disciplined" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Least disciplined" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Club 0")).toHaveLength(1);
    expect(screen.getAllByText("Club 6")).toHaveLength(1);
    expect(screen.getAllByRole("link")).toHaveLength(10);
  });
});
