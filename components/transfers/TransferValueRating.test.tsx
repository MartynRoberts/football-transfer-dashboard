import { render, screen } from "@testing-library/react";
import TransferValueRating from "./TransferValueRating";

describe("TransferValueRating", () => {
  it("rates a free transfer as exceptional value for the buyer", () => {
    render(
      <TransferValueRating
        fee={null}
        marketValue={8_000_000}
        transferType="free transfer"
      />,
    );

    expect(screen.getByText("Exceptional value")).toBeInTheDocument();
    expect(screen.getByText("Free transfer")).toBeInTheDocument();
  });

  it("rates a free departure as very poor value for the seller", () => {
    render(
      <TransferValueRating
        fee={null}
        marketValue={8_000_000}
        transferType="free transfer"
        perspective="seller"
      />,
    );

    expect(screen.getByText("Very poor value")).toBeInTheDocument();
    expect(screen.getByText("Player left for free")).toBeInTheDocument();
  });

  it("keeps an undisclosed fee unrated", () => {
    render(<TransferValueRating fee={null} marketValue={8_000_000} />);
    expect(screen.getByText("Unrated")).toBeInTheDocument();
  });
});
