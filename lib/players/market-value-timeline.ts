interface MarketValuePoint {
  date: string;
  marketValue: number;
  clubName?: string | null;
}

export function buildMarketValueTimeline(data: MarketValuePoint[]) {
  const chartData = data
    .map((point) => ({ ...point, timestamp: new Date(point.date).getTime() }))
    .filter((point) => Number.isFinite(point.timestamp))
    .sort((first, second) => first.timestamp - second.timestamp);

  if (chartData.length === 0) return null;

  const firstYear = new Date(chartData[0].timestamp).getUTCFullYear();
  const lastYear = new Date(chartData[chartData.length - 1].timestamp).getUTCFullYear();
  const yearTicks = Array.from(
    { length: lastYear - firstYear + 1 },
    (_, index) => Date.UTC(firstYear + index, 0, 1),
  );

  return {
    chartData,
    yearTicks,
    timeDomain: [
      Date.UTC(firstYear, 0, 1),
      Date.UTC(lastYear + 1, 0, 1),
    ] as [number, number],
  };
}
