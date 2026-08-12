import { formatNetSpend, getLastThreeSeasons } from "./clubs/transfer-summary";
import {
  calculateInjuryGamesPercentage,
  findRecurrentInjury,
} from "./players/injury-metrics";
import { getCurrentSeason } from "./sync/scope";
import { getLastThreeTransferSeasons } from "./transfers/get-last-three-transfer-seasons";
import { assessTransferValue } from "./transfers/value-rating";

describe("business rules", () => {
  it("builds descending season windows", () => {
    expect(getLastThreeTransferSeasons("26/27")).toEqual(["26/27", "25/26", "24/25"]);
    expect(getLastThreeSeasons("00/01")).toEqual(["00/01", "99/00", "98/99"]);
    expect(getLastThreeTransferSeasons("unknown")).toEqual(["unknown"]);
  });

  it("switches season at the configured kickoff instant", () => {
    expect(getCurrentSeason(new Date("2026-08-20T22:59:59Z"))).toBe("25/26");
    expect(getCurrentSeason(new Date("2026-08-20T23:00:00Z"))).toBe("26/27");
  });

  test.each([
    [0, 10, "Exceptional value"],
    [50, 100, "Exceptional value"],
    [75, 100, "Excellent value"],
    [100, 100, "Good value"],
    [125, 100, "Fair value"],
    [150, 100, "Expensive"],
    [151, 100, "Very expensive"],
  ])("rates fee %s against value %s", (fee, value, rating) => {
    expect(assessTransferValue(fee, value).rating).toBe(rating);
  });

  it("does not rate incomplete valuations", () => {
    expect(assessTransferValue(null, 100)).toEqual({ rating: "Unrated", ratio: null, percentageDifference: null });
    expect(assessTransferValue(100, 0).rating).toBe("Unrated");
  });

  it("formats spend, profit, and balanced activity", () => {
    expect(formatNetSpend(1_000)).toEqual({ value: "€1,000", detail: "(Based on known fees)" });
    expect(formatNetSpend(-1_000)).toEqual({ value: "€1,000", detail: "Net transfer profit" });
    expect(formatNetSpend(0)).toEqual({ value: "€0", detail: "Balanced transfer activity" });
  });

  it("calculates absence rate and recurrent injury groups", () => {
    expect(calculateInjuryGamesPercentage(5, 15)).toBe(25);
    expect(calculateInjuryGamesPercentage(0, 0)).toBeNull();
    const injury = (description: string) => ({ description, startDate: new Date(), expectedReturn: null, days: null, gamesMissed: null, season: null });
    expect(findRecurrentInjury([injury("Hamstring strain"), injury("Hamstring injury")])).toEqual({ warning: true, group: "Hamstring", count: 2 });
    expect(findRecurrentInjury([injury("Ankle injury")]).warning).toBe(false);
  });
});
