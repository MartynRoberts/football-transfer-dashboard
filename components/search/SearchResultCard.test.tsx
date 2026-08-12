import { fireEvent, render, screen } from "@testing-library/react";
import SearchResultCard from "./SearchResultCard";

describe("SearchResultCard", () => {
  it("shows a player image and falls back to the silhouette on failure", () => {
    const { container } = render(
      <SearchResultCard
        result={{
          name: "Harry Kane",
          type: "player",
          detail: "Centre-Forward",
          imageUrl: "https://example.com/kane.png",
        }}
      />,
    );
    const image = screen.getByRole("img", { name: "Harry Kane profile" });
    expect(image).toHaveAttribute("src", "https://example.com/kane.png");
    fireEvent.error(image);
    expect(screen.queryByRole("img", { name: "Harry Kane profile" })).not.toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/images/player-placeholder.png",
    );
  });

  it("shows a club crest using the shared reliable logo path", () => {
    render(
      <SearchResultCard
        result={{
          name: "Aston Villa",
          type: "club",
          logoUrl: "https://tmssl.akamaized.net/images/405.png",
        }}
      />,
    );
    expect(screen.getByRole("img", { name: "Aston Villa badge" })).toHaveAttribute(
      "src",
      expect.stringContaining("/api/images/club-logo?url="),
    );
  });

  it("shows the local logo for a known league", () => {
    render(
      <SearchResultCard
        result={{
          name: "Premier League",
          type: "league",
          detail: "England",
          transfermarktId: "GB1",
        }}
      />,
    );
    expect(screen.getByRole("img", { name: "Premier League logo" })).toHaveAttribute(
      "src",
      "/leagues/premier-league.png",
    );
  });
});
