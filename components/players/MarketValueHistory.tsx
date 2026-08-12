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
      <h2 className="section-title">Market Value History</h2>
      {histories.length === 0 ? (
        <p className="text-gray-500">No market values recorded.</p>
      ) : (
        <div className="flex min-w-0 flex-col gap-4 xl:flex-row">
          <div className="analytics-panel min-w-0 flex-1 sm:px-4">
            <MarketValueChart data={chartData} />
          </div>

          {hasPercentiles && (
            <div className="analytics-panel xl:w-80 xl:shrink-0">
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
        </div>
      )}
    </section>
  );
}
