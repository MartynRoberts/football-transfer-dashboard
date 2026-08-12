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
import { buildMarketValueTimeline } from "@/lib/players/market-value-timeline";
import { formatPounds } from "@/lib/currency";

interface MarketValuePoint {
  date: string;
  marketValue: number;
  clubName?: string | null;
}

interface MarketValueChartProps {
  data: MarketValuePoint[];
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

  const timeline = buildMarketValueTimeline(data);

  if (!timeline) return null;

  const { chartData, yearTicks, timeDomain } = timeline;

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
            right: 8,
            bottom: 8,
            left: 0,
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
            tickMargin={12}
            height={40}
            minTickGap={35}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tickFormatter={(value) => formatPounds(Number(value))}
            width={56}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            formatter={(value) => [
              formatPounds(Number(value)),
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
