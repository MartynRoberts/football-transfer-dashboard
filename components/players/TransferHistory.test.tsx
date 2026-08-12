import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import TransferHistory from "./TransferHistory";

const transfers = [
  {
    id: "1",
    transferDate: new Date("2024-01-04T12:00:00Z"),
    fee: null,
    marketValue: 8_000_000,
    transferType: "end of loan",
    player: { name: "Djed Spence", slug: "djed-spence-483348" },
    fromClub: { name: "Leeds", slug: "leeds-united-399", logoUrl: null },
    toClub: { name: "Tottenham", slug: "tottenham-hotspur-148", logoUrl: null },
  },
];

describe("TransferHistory", () => {
  it("renders UK dates, direction, labels, links, and transfer type", () => {
    render(<TransferHistory transfers={transfers} showPlayer />);
    const row = screen.getByRole("row", { name: /04\/01\/2024/ });
    expect(within(row).getByText("Leeds")).toBeInTheDocument();
    expect(within(row).getByText("Tottenham")).toBeInTheDocument();
    expect(within(row).getByText("End of loan")).toBeInTheDocument();
    expect(within(row).getByText("£6.9m")).toBeInTheDocument();
    expect(within(row).getByRole("link", { name: "Djed Spence" })).toHaveAttribute("href", "/players/djed-spence-483348");
    expect(within(row).getByText("Leeds").closest("td")).toHaveAttribute("data-label", "From");
    expect(within(row).getByText("Tottenham").closest("td")).toHaveAttribute("data-label", "To");
  });

  it("handles free agents and an empty history", () => {
    render(<TransferHistory transfers={[]} emptyMessage="Nothing yet" />);
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
  });

  it("has no basic accessibility violations", async () => {
    const { container } = render(<TransferHistory transfers={transfers} showPlayer />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
