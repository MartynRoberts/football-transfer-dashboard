jest.mock("@/lib/prisma", () => ({
  prisma: {
    transfer: { findMany: jest.fn(), groupBy: jest.fn() },
    club: { findMany: jest.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { getHomePageData } from "./get-home-page-data";

const transferFindMany = prisma.transfer.findMany as jest.Mock;
const transferGroupBy = prisma.transfer.groupBy as jest.Mock;
const clubFindMany = prisma.club.findMany as jest.Mock;

describe("getHomePageData", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T12:00:00Z"));
    transferFindMany.mockResolvedValue([]);
    transferGroupBy.mockResolvedValue([]);
    clubFindMany.mockResolvedValue([]);
  });

  afterEach(() => jest.useRealTimers());

  it("limits latest transfers to today and orders newest first", async () => {
    const data = await getHomePageData();
    const latestQuery = transferFindMany.mock.calls[0][0];

    expect(latestQuery.where.transferDate.lte).toEqual(new Date("2026-08-12T12:00:00Z"));
    expect(latestQuery.orderBy[0]).toEqual({ transferDate: { sort: "desc", nulls: "last" } });
    expect(latestQuery.take).toBe(10);
    expect(data.latestTransfers).toEqual([]);
  });

  it("restricts latest transfers to top-five league involvement", async () => {
    await getHomePageData();
    const serialized = JSON.stringify(transferFindMany.mock.calls[0][0].where.OR);
    for (const id of ["GB1", "L1", "ES1", "IT1", "FR1"]) {
      expect(serialized).toContain(id);
    }
  });
});
