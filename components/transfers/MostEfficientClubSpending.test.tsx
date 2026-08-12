import { render, screen } from "@testing-library/react";
import MostEfficientClubSpending from "./MostEfficientClubSpending";

const club = (id: string, name: string, efficiencyScore: number) => ({
  id,
  name,
  slug: name.toLowerCase(),
  logoUrl: null,
  leagueName: "Premier League",
  netSpend: 0,
  efficiencyScore,
  purchaseValue: 0,
  saleValue: 0,
  ratedDeals: 1,
});

describe("MostEfficientClubSpending", () => {
  it("only adds a plus sign to positive efficiency values", () => {
    render(
      <MostEfficientClubSpending
        clubs={[
          club("1", "Positive", 5_000_000),
          club("2", "Negative", -5_000_000),
          club("3", "Balanced", 0),
        ]}
        seasons={["26/27"]}
      />,
    );

    expect(screen.getByText("+£4.3m")).toBeInTheDocument();
    expect(screen.getByText("-£4.3m")).toBeInTheDocument();
    expect(screen.getByText("£0")).toBeInTheDocument();
    expect(screen.queryByText("+-£4.3m")).not.toBeInTheDocument();
  });
});
