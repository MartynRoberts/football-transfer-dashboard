import { ordinal, pluralizePosition } from "@/lib/players/formatters";
import type { PlayerWithPageRelations } from "@/lib/players/types";

function HeightPercentile({
  value,
  comparison,
}: {
  value: number;
  comparison: string;
}) {
  const boundedValue = Math.max(0, Math.min(100, Math.round(value)));

  const groupPercentage = boundedValue < 50 ? boundedValue : 100 - boundedValue;

  const comparisonText =
    boundedValue < 50
      ? `In the shortest ${groupPercentage}% of ${comparison}`
      : `In the tallest ${groupPercentage}% of ${comparison}`;

  return (
    <div>
      <div className="mb-2 flex min-w-0 items-center gap-2 sm:gap-3">
        <div
          className="relative h-2 flex-1 rounded-full bg-slate-200"
          role="progressbar"
          aria-label={`Height: ${ordinal(boundedValue)} percentile`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={boundedValue}
        >
          <div
            className="bg-brand h-full rounded-full"
            style={{ width: `${boundedValue}%` }}
          />

          <span
            className="bg-brand absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
            style={{ left: `${boundedValue}%` }}
          />
        </div>

        <span className="min-w-20 text-right text-xs font-semibold sm:min-w-28 sm:text-sm">
          {ordinal(boundedValue)} percentile
        </span>
      </div>

      <p className="text-sm text-slate-500">{comparisonText}</p>
    </div>
  );
}

export default function HeightPercentiles({
  player,
}: {
  player: PlayerWithPageRelations;
}) {
  const metric = player.metric;
  const hasPercentile =
    metric &&
    (metric.heightPercentilePosition !== null ||
      metric.heightPercentileOverall !== null);

  if (player.height === null || !hasPercentile) return null;

  return (
    <section className="analytics-panel">
      <h2 className="text-sm text-gray-500">Height</h2>
      <div className="mt-1 text-xl font-semibold">{player.height}cm</div>

      <div className="grid gap-5 mt-4">
        {metric.heightPercentilePosition !== null && player.position && (
          <HeightPercentile
            value={metric.heightPercentilePosition}
            comparison={
              player.currentClub?.league?.name
                ? `${pluralizePosition(player.position)} in ${
                    player.currentClub.league.name
                  }`
                : pluralizePosition(player.position)
            }
          />
        )}
        {metric.heightPercentileOverall !== null && (
          <HeightPercentile
            value={metric.heightPercentileOverall}
            comparison="top-five-league first-team players"
          />
        )}
      </div>
    </section>
  );
}
