import { render, screen } from "@testing-library/react";
import InjuryHistory from "./InjuryHistory";

describe("InjuryHistory", () => {
  it("renders injury and return dates in UK format", () => {
    render(
      <InjuryHistory
        metric={null}
        injuries={[
          {
            id: "injury-1",
            description: "Ankle injury",
            season: "26/27",
            startDate: new Date("2026-12-01T12:00:00Z"),
            expectedReturn: new Date("2026-12-31T12:00:00Z"),
            days: 30,
            gamesMissed: 5,
          },
        ] as never}
      />,
    );

    expect(screen.getByText("01/12/2026")).toBeInTheDocument();
    expect(screen.getByText("31/12/2026")).toBeInTheDocument();
    expect(screen.queryByText("12/31/2026")).not.toBeInTheDocument();
  });

  it("renders a clear empty state", () => {
    render(<InjuryHistory metric={null} injuries={[]} />);
    expect(screen.getByText("No injury records available.")).toBeInTheDocument();
  });
});
