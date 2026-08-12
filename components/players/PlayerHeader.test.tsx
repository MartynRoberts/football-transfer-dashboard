import { calculateAge } from "./PlayerHeader";

describe("calculateAge", () => {
  const birthday = new Date("2000-08-20T00:00:00Z");

  it("subtracts a year before the birthday", () => {
    expect(calculateAge(birthday, new Date("2026-08-19T12:00:00Z"))).toBe(25);
  });

  it("increments on the birthday", () => {
    expect(calculateAge(birthday, new Date("2026-08-20T00:00:00Z"))).toBe(26);
  });
});
