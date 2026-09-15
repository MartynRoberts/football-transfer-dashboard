import { effectiveTransferDateFilter } from "./effective-transfers";

describe("effectiveTransferDateFilter", () => {
  it("includes transfers with no date or a date that has come into effect", () => {
    const now = new Date("2026-09-15T12:00:00Z");

    expect(effectiveTransferDateFilter(now)).toEqual({
      OR: [{ transferDate: null }, { transferDate: { lte: now } }],
    });
  });
});
