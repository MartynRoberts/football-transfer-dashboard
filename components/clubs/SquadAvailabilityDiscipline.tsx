type LeagueBenchmark = {
  rank: number;
  teamCount: number;
  comparisonText: string;
  favourableLabel: string;
  unfavourableLabel: string;
  invertScale?: boolean;
  gradientDirection?: "red-to-green" | "green-to-red";
};

type StatRow = {
  label: string;
  value: string;
  comparison?: string;
};

type StatCardData = {
  title: string;
  headlineLabel: string;
  headlineValue: string;
  benchmark: LeagueBenchmark;
  rows: StatRow[];
  note?: string;
};

type SquadAvailabilityDisciplineProps = {
  season: string;
  leagueName: string;
  injury: StatCardData;
  discipline: StatCardData;
};

function ordinal(value: number): string {
  const mod100 = value % 100;

  if (mod100 >= 11 && mod100 <= 13) {
    return `${value}th`;
  }

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

function BenchmarkTrack({
  benchmark,
  leagueName,
}: {
  benchmark: LeagueBenchmark;
  leagueName: string;
}) {
  const denominator = Math.max(benchmark.teamCount - 1, 1);

  const basePosition = Math.min(
    100,
    Math.max(0, ((benchmark.rank - 1) / denominator) * 100),
  );

  const markerPosition = benchmark.invertScale
    ? 100 - basePosition
    : basePosition;

  const gradientClass =
    benchmark.gradientDirection === "red-to-green"
      ? "bg-gradient-to-r from-red-500 via-amber-400 to-green-500"
      : "bg-gradient-to-r from-green-500 via-amber-400 to-red-500";

  return (
    <div className="mt-5">
      <div className="flex justify-between gap-4 text-xs text-slate-500">
        <span>{benchmark.favourableLabel}</span>
        <span className="text-right">{benchmark.unfavourableLabel}</span>
      </div>

      <div
        className={`relative mt-2 h-2 rounded-full ${gradientClass}`}
        role="img"
        aria-label={`${ordinal(benchmark.rank)} of ${benchmark.teamCount} ${leagueName} teams. ${benchmark.comparisonText}`}
      >
        <span
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow-sm"
          style={{ left: `${markerPosition}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-slate-900">
          {ordinal(benchmark.rank)} of {benchmark.teamCount} {leagueName} teams
        </p>

        <p className="text-sm text-slate-600">{benchmark.comparisonText}</p>
      </div>
    </div>
  );
}

function StatCard({
  data,
  leagueName,
}: {
  data: StatCardData;
  leagueName: string;
}) {
  return (
    <article className="analytics-panel">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {data.title}
      </p>

      <div className="mt-4">
        <p className="text-sm text-slate-500">{data.headlineLabel}</p>
        <p className="mt-1 text-3xl font-bold text-slate-950">
          {data.headlineValue}
        </p>
      </div>

      <BenchmarkTrack benchmark={data.benchmark} leagueName={leagueName} />

      <dl className="mt-6 divide-y">
        {data.rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0"
          >
            <dt className="text-sm text-slate-600">{row.label}</dt>
            <dd className="font-semibold text-slate-950">{row.value}</dd>
            {row.comparison && (
              <dd className="col-span-2 text-xs text-slate-500">
                {row.comparison}
              </dd>
            )}
          </div>
        ))}
      </dl>

      {data.note && <p className="mt-5 text-xs text-slate-500">{data.note}</p>}
    </article>
  );
}

export default function SquadAvailabilityDiscipline({
  season,
  leagueName,
  injury,
  discipline,
}: SquadAvailabilityDisciplineProps) {
  return (
    <section aria-labelledby="availability-discipline-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2
            id="availability-discipline-heading"
            className="section-title mb-0"
          >
            Squad availability &amp; discipline
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {season} · {leagueName} · League matches only
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatCard data={injury} leagueName={leagueName} />
        <StatCard data={discipline} leagueName={leagueName} />
      </div>
    </section>
  );
}
