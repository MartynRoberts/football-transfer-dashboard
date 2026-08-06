import ClubIdentity from "@/components/clubs/ClubIdentity";
import LeagueIdentity from "@/components/leagues/LeagueIdentity";

interface SummaryMetric {
  label: string;
  value: string | number;
  detail?: string;
}

export default function ClubSummary({
  club,
  metrics,
}: {
  club: Parameters<typeof ClubIdentity>[0]["club"];
  metrics: SummaryMetric[];
}) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <ClubIdentity club={club} showLeague={false} link={false} h1 />
        {club.league && <LeagueIdentity league={club.league} link />}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">{metric.label}</p>
            <p className="text-2xl font-bold">{metric.value}</p>
            {metric.detail && (
              <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
