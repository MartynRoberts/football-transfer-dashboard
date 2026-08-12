import { render, screen } from "@testing-library/react";
import PlayerDiscipline from "@/components/players/PlayerDiscipline";
import type { SeasonPerformance } from "@/lib/players/types";

function season(overrides: Partial<SeasonPerformance> = {}): SeasonPerformance {
  return {
    season: "25/26",
    appearances: 20,
    minutesPlayed: 1800,
    goals: 0,
    assists: 0,
    yellowCards: 4,
    redCards: 1,
    cardsPerAppearance: 0.25,
    cardsPer90: "0.25",
    goalsPer90: "0.00",
    assistsPer90: "0.00",
    contributionsPer90: "0.00",
    minutesPerContribution: null,
    involvement: { teamGoals: 0, goalContributions: 0, percentage: null },
    rankings: {
      leaguePositionGoals: { rank: null, total: 0 },
      leaguePositionAssists: { rank: null, total: 0 },
      topFivePositionGoals: { rank: null, total: 0 },
      topFivePositionAssists: { rank: null, total: 0 },
    },
    ...overrides,
  };
}

describe("PlayerDiscipline", () => {
  it("shows career totals and season-level disciplinary rates", () => {
    render(
      <PlayerDiscipline
        seasons={[
          season(),
          season({
            season: "24/25",
            appearances: 10,
            minutesPlayed: 900,
            yellowCards: 2,
            redCards: 0,
            cardsPerAppearance: 0.2,
            cardsPer90: "0.20",
          }),
        ]}
      />,
    );

    expect(
      screen.getByText("Career yellow cards").nextSibling,
    ).toHaveTextContent("6");
    expect(screen.getByText("Career red cards").nextSibling).toHaveTextContent(
      "1",
    );
    expect(screen.getByText("24/25")).toBeInTheDocument();
    expect(screen.getAllByText("0.20")).toHaveLength(2);
  });

  it("shows an empty state", () => {
    render(<PlayerDiscipline seasons={[]} />);
    expect(
      screen.getByText("No disciplinary statistics available."),
    ).toBeInTheDocument();
  });
});
