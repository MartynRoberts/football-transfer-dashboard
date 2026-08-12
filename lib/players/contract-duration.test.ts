import { formatContractTimeRemaining } from "./contract-duration";

describe("formatContractTimeRemaining", () => {
  const today = new Date("2026-08-12T12:00:00Z");

  test.each([
    ["2028-11-12T12:00:00Z", "2 years, 3 months left"],
    ["2027-08-12T12:00:00Z", "1 year left"],
    ["2026-10-12T12:00:00Z", "2 months left"],
    ["2026-09-12T12:00:00Z", "1 month left"],
    ["2026-08-31T12:00:00Z", "Less than 1 month left"],
    ["2026-08-11T12:00:00Z", "Contract expired"],
  ])("formats %s", (date, expected) => {
    expect(formatContractTimeRemaining(new Date(date), today)).toBe(expected);
  });
});
