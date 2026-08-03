import { ordinal } from "@/lib/players/formatters";
import type { PlayerWithPageRelations } from "@/lib/players/types";

export default function AppearanceMetrics({
  metric,
}: {
  metric: PlayerWithPageRelations["metric"];
}) {
  if (!metric) return null;

  const cards = [
    {
      label: "Appearances",
      value: metric.appearances?.toLocaleString() ?? "-",
    },
    {
      label: "Minutes played",
      value: metric.minutesPlayed?.toLocaleString() ?? "-",
    },
    {
      label: "Club minutes rank",
      value:
        metric.clubMinutesRank !== null ? ordinal(metric.clubMinutesRank) : "-",
    },
    {
      label: "League minutes rank",
      value:
        metric.leagueMinutesRank !== null
          ? ordinal(metric.leagueMinutesRank)
          : "-",
    },
    {
      label: "Position minutes rank",
      value:
        metric.positionMinutesRank !== null
          ? ordinal(metric.positionMinutesRank)
          : "-",
    },
  ];

  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Appearances</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border p-4">
            <div className="text-sm text-slate-500">{card.label}</div>
            <div className="mt-1 text-2xl font-semibold">{card.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
