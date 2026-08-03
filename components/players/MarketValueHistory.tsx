import MarketValueChart from "@/components/players/MarketValueChart";
import MarketValuePercentile from "@/components/players/MarketValuePercentile";
import { pluralizePosition } from "@/lib/players/formatters";
import type {
  MarketValueChartPoint,
  PlayerWithPageRelations,
} from "@/lib/players/types";

interface MarketValueHistoryProps {
  histories: PlayerWithPageRelations["marketValueHistories"];
  chartData: MarketValueChartPoint[];
  metric: PlayerWithPageRelations["metric"];
  leagueName: string | null;
  position: string | null;
}

export default function MarketValueHistory({
  histories,
  chartData,
  metric,
  leagueName,
  position,
}: MarketValueHistoryProps) {
  const hasPercentiles =
    metric &&
    (metric.marketValuePercentileWorldwide !== null ||
      metric.marketValuePercentileLeague !== null ||
      metric.marketValuePercentilePosition !== null);

  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Market Value History</h2>
      {histories.length === 0 ? (
        <p className="text-gray-500">No market values recorded.</p>
      ) : (
        <div className="flex gap-4">
          <div className="rounded-lg border p-4 md:p-6 flex-1">
            <MarketValueChart data={chartData} />
          </div>

          {hasPercentiles && (
            <div className="rounded-lg border p-5">
              <h3 className="mb-5 text-lg font-semibold">
                Market value percentile
              </h3>
              <div className="space-y-5">
                {metric.marketValuePercentileWorldwide !== null && (
                  <MarketValuePercentile
                    label="Worldwide"
                    value={metric.marketValuePercentileWorldwide}
                    description="Compared with all tracked players"
                  />
                )}
                {metric.marketValuePercentileLeague !== null && (
                  <MarketValuePercentile
                    label={leagueName ?? "Current league"}
                    value={metric.marketValuePercentileLeague}
                    description="Compared with players in this league"
                  />
                )}
                {metric.marketValuePercentilePosition !== null && (
                  <MarketValuePercentile
                    label="Position"
                    value={metric.marketValuePercentilePosition}
                    description={
                      position
                        ? `Compared with ${pluralizePosition(position)}`
                        : "Compared with players in this position"
                    }
                  />
                )}
              </div>
            </div>
          )}

          {/* Full market value history table */}
          {/*
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Value</th>
                  <th className="p-3 text-left">Club</th>
                </tr>
              </thead>
              <tbody>
                {histories.map((history) => (
                  <tr key={history.id} className="border-b last:border-b-0">
                    <td className="p-3">{history.date.toLocaleDateString()}</td>
                    <td className="p-3 font-medium">
                      €{history.marketValue.toLocaleString()}
                    </td>
                    <td className="p-3">{history.clubName ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          */}
        </div>
      )}
    </section>
  );
}
