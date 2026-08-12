import { buildMarketValueTimeline } from "./market-value-timeline";

describe("buildMarketValueTimeline", () => {
  it("positions points by their actual dates and emits one tick per year", () => {
    const result = buildMarketValueTimeline([
      { date: "2024-09-15", marketValue: 60_000_000, clubName: "A" },
      { date: "2022-06-01", marketValue: 15_000_000, clubName: "B" },
      { date: "2024-01-15", marketValue: 45_000_000, clubName: "A" },
    ]);

    expect(result?.chartData.map((point) => point.date)).toEqual([
      "2022-06-01",
      "2024-01-15",
      "2024-09-15",
    ]);
    expect(result?.yearTicks.map((tick) => new Date(tick).getUTCFullYear())).toEqual([2022, 2023, 2024]);
    expect(result?.chartData[1].timestamp).not.toBe(result?.chartData[2].timestamp);
  });

  it("drops invalid dates and handles empty data", () => {
    expect(buildMarketValueTimeline([])).toBeNull();
    expect(buildMarketValueTimeline([{ date: "invalid", marketValue: 1, clubName: null }])).toBeNull();
  });
});
