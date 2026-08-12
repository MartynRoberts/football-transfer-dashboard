import { EUR_TO_GBP_RATE, eurosToPounds, formatPounds } from "./currency";

describe("GBP currency presentation", () => {
  it("uses the documented EUR to GBP rate", () => {
    expect(EUR_TO_GBP_RATE).toBe(0.85635);
    expect(eurosToPounds(1_000_000)).toBe(856_350);
  });

  test.each([
    [1_000_000_000, "£856.4m"],
    [100_000_000, "£85.6m"],
    [8_000_000, "£6.9m"],
    [1_100_000, "£942k"],
    [1_000, "£856"],
    [100, "£86"],
    [-8_000_000, "-£6.9m"],
    [0, "£0"],
  ])("formats €%s as %s", (euros, expected) => {
    expect(formatPounds(euros)).toBe(expected);
  });
});
