import { formatMarketValue, formatTransferFee } from "./formatters";

describe("transfer formatters", () => {
  test.each([
    [null, "loan transfer", "Loan transfer"],
    [null, "end of loan", "End of loan"],
    [null, "free transfer", "Free transfer"],
    [null, null, "Undisclosed"],
    [0, null, "Free"],
    [1_100_000, null, "€1,100,000"],
  ])("formats fee %s and type %s", (fee, type, expected) => {
    expect(formatTransferFee(fee, type)).toBe(expected);
  });

  it("formats and safely falls back for market values", () => {
    expect(formatMarketValue(8_000_000)).toBe("€8,000,000");
    expect(formatMarketValue(null)).toBe("-");
  });
});
