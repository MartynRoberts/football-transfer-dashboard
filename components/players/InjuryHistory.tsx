import type { ReactNode } from "react";

import type { PlayerWithPageRelations } from "@/lib/players/types";
import { formatRank } from "@/utils/formatRank";

export default function InjuryHistory({
  injuries,
  metric,
}: {
  injuries: PlayerWithPageRelations["injuries"];
  metric: PlayerWithPageRelations["metric"];
}) {
  return (
    <section>
      <h2 className="section-title">Injury History</h2>

      {metric && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InjuryInsightCard
            label="Season absence rate"
            value={formatPercentage(metric.seasonInjuryGamesPercentage)}
            detail={formatGamesMissed(metric.seasonGamesMissed)}
          />

          <InjuryInsightCard
            label="Career absence rate"
            value={formatPercentage(metric.careerInjuryGamesPercentage)}
            detail={formatGamesMissed(metric.careerGamesMissed)}
          />

          {metric.premierLeagueAvailabilityRank !== null && (
            <InjuryInsightCard
              label="Premier League availability"
              value={formatRank(
                metric.premierLeagueAvailabilityRank,
                metric.premierLeagueAvailabilityRankTotal,
              )}
              detail="Current-season availability"
            />
          )}

          <InjuryInsightCard
            label="Top five leagues availability"
            value={formatRank(
              metric.topFiveAvailabilityRank,
              metric.topFiveAvailabilityRankTotal,
            )}
            detail="Current-season availability"
          />
        </div>
      )}

      {metric?.recurrentInjuryWarning && (
        <div className="mb-6 border border-amber-300 bg-amber-50 p-4">
          <div className="font-semibold text-amber-900">
            Recurrent injury warning
          </div>

          <p className="mt-1 text-sm text-amber-800">
            {metric.recurrentInjuryGroup ?? "A similar injury"} has been
            recorded {metric.recurrentInjuryCount ?? 0} times.
          </p>
        </div>
      )}

      {injuries.length === 0 ? (
        <p className="text-slate-500">No injury records available.</p>
      ) : (
        <div className="mobile-card-table overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3 text-left">Injury</th>

                <th className="p-3 text-left">Season</th>

                <th className="p-3 text-left">Start date</th>

                <th className="p-3 text-left">Return date</th>

                <th className="p-3 text-left">Days injured</th>

                <th className="p-3 text-left">Games missed</th>
              </tr>
            </thead>

            <tbody>
              {injuries.map((injury) => (
                <tr key={injury.id} className="border-b">
                  <td data-label="Injury" className="p-3 font-medium">
                    {injury.description}
                  </td>

                  <td data-label="Season" className="p-3">
                    {injury.season ?? "-"}
                  </td>

                  <td data-label="Start date" className="p-3">
                    {injury.startDate.toLocaleDateString("en-GB")}
                  </td>

                  <td data-label="Return date" className="p-3">
                    {injury.expectedReturn?.toLocaleDateString("en-GB") ?? "-"}
                  </td>

                  <td data-label="Days injured" className="p-3">
                    {injury.days?.toLocaleString() ?? "-"}
                  </td>

                  <td data-label="Games missed" className="p-3">
                    {injury.gamesMissed?.toLocaleString() ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function InjuryInsightCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
}) {
  return (
    <div className="analytics-panel">
      <div className="text-sm text-slate-500">{label}</div>

      <div className="mt-1 text-2xl font-semibold">{value}</div>

      {detail && <div className="mt-1 text-sm text-slate-500">{detail}</div>}
    </div>
  );
}

function formatPercentage(value: number | null): string {
  if (value === null) {
    return "-";
  }

  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })}%`;
}

function formatGamesMissed(gamesMissed: number | null): string | undefined {
  if (gamesMissed === null) {
    return undefined;
  }

  return `${gamesMissed.toLocaleString()} ${
    gamesMissed === 1 ? "game" : "games"
  } missed`;
}
