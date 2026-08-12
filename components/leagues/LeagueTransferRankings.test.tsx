import { render, screen } from "@testing-library/react";
import LeagueTransferRankings from "./LeagueTransferRankings";

describe("LeagueTransferRankings", () => {
  it("provides labelled fields for mobile card layouts", () => {
    const league = {
      id: "1",
      name: "Premier League",
      slug: "premier-league",
      country: "England",
      transfermarktId: "GB1",
      totalSpend: 100,
      totalIncome: 50,
      netSpend: 50,
      efficiencyScore: 25,
    };
    render(<LeagueTransferRankings finances={[league]} seasons={["26/27"]} />);
    const leagueCells = screen.getAllByRole("cell", { name: /Premier League/ });
    expect(leagueCells).toHaveLength(2);
    expect(leagueCells[0]).toHaveAttribute("data-label", "League");
    expect(screen.getAllByText("€50")[0].closest("td")).toHaveAttribute("data-label", "Income");
    expect(screen.getByText("€25").closest("td")).toHaveAttribute("data-label", "Efficiency");
  });
});
