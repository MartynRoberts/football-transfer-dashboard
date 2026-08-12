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
      <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 [&_h1]:text-2xl [&_h1]:leading-tight [&_h1]:break-words sm:[&_h1]:text-3xl">
          <ClubIdentity
            club={club}
            showLeague={false}
            link={false}
            h1
            imagePreload
          />
        </div>

        {club.league && (
          <div className="min-w-0 border-t pt-4 sm:border-t-0 sm:pt-0">
            <LeagueIdentity league={club.league} link />
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-6 gap-3 sm:gap-4 lg:grid-cols-5">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={`analytics-panel min-w-0 lg:col-span-1 ${
              index < 3
                ? "col-span-2"
                : "col-span-6 min-[560px]:col-span-3"
            }`}
          >
            <p className="text-sm text-gray-500">{metric.label}</p>
            <p
              className={`font-bold ${
                index < 3
                  ? "text-xl sm:text-2xl"
                  : "text-xl whitespace-nowrap xl:text-2xl"
              }`}
            >
              {metric.value}
            </p>
            {metric.detail && (
              <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
