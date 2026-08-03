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

  return (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <div
          className="relative h-2 flex-1 rounded-full bg-slate-200"
          role="progressbar"
          aria-label={`Height: ${ordinal(boundedValue)} percentile`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={boundedValue}
        >
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${boundedValue}%` }}
          />
          <span
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 shadow-sm"
            style={{ left: `${boundedValue}%` }}
          />
        </div>
        <span className="min-w-28 text-sm font-semibold">
          {ordinal(boundedValue)} percentile
        </span>
      </div>
      <p className="text-sm text-slate-500">
        Taller than {boundedValue}% of {comparison}
      </p>
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
    <section className="rounded-lg border p-5">
      <h2 className="mb-4 text-lg font-semibold">Height percentile</h2>
      <div className="grid gap-5">
        {metric.heightPercentilePosition !== null && player.position && (
          <HeightPercentile
            value={metric.heightPercentilePosition}
            comparison={pluralizePosition(player.position)}
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
