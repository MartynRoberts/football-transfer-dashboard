"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MarketValuePoint {
  date: string;
  marketValue: number;
  clubName?: string | null;
}

interface MarketValueChartProps {
  data: MarketValuePoint[];
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `€${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}m`;
  }

  if (value >= 1_000) {
    return `€${Math.round(value / 1_000)}k`;
  }

  return `€${value.toLocaleString()}`;
}

function formatDate(value: number | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatYear(value: number): string {
  return new Date(value).getUTCFullYear().toString();
}

export default function MarketValueChart({ data }: MarketValueChartProps) {
  if (data.length === 0) {
    return null;
  }

  const chartData = data.map((point) => ({
    ...point,
    timestamp: new Date(point.date).getTime(),
  }));
  const firstYear = new Date(chartData[0].timestamp).getUTCFullYear();
  const lastYear = new Date(
    chartData[chartData.length - 1].timestamp,
  ).getUTCFullYear();
  const yearTicks = Array.from(
    { length: lastYear - firstYear + 1 },
    (_, index) => Date.UTC(firstYear + index, 0, 1),
  );
  const timeDomain: [number, number] = [
    Date.UTC(firstYear, 0, 1),
    Date.UTC(lastYear + 1, 0, 1),
  ];

  return (
    <div
      className="h-72 min-w-0 w-full sm:h-80"
      role="img"
      aria-label="Player market value history line chart"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 12,
            right: 20,
            bottom: 8,
            left: 8,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={timeDomain}
            ticks={yearTicks}
            tickFormatter={formatYear}
            minTickGap={35}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tickFormatter={(value) => formatCurrency(Number(value))}
            width={70}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            formatter={(value) => [
              formatCurrency(Number(value)),
              "Market value",
            ]}
            labelFormatter={(label) => formatDate(Number(label))}
            contentStyle={{
              borderRadius: "0.5rem",
            }}
          />

          <Line
            type="monotone"
            dataKey="marketValue"
            name="Market value"
            stroke="currentColor"
            strokeWidth={3}
            dot={{
              r: 4,
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
            }}
            className="text-brand"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
