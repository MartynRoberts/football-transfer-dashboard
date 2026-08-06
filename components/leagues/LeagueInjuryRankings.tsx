import Link from "next/link";
import ClubName from "@/components/clubs/ClubName";
import type { ClubInjuryRow } from "@/lib/leagues/types";

export function InjuryProneSquadExtremes({
  most,
  least,
  season,
}: {
  most: ClubInjuryRow[];
  least: ClubInjuryRow[];
  season: string;
}) {
  return (
    <section>
      <h2 className="section-title">Most and least injury-prone squads</h2>
      <p className="mb-4 text-sm text-slate-500">
        Top-three comparison for {season}, based on reported games missed
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <ExtremeList
          title="Most injury-prone"
          clubs={most}
          tone="unfavourable"
        />
        <ExtremeList
          title="Least injury-prone"
          clubs={least}
          tone="favourable"
        />
      </div>
    </section>
  );
}

function ExtremeList({
  title,
  clubs,
  tone,
}: {
  title: string;
  clubs: ClubInjuryRow[];
  tone: "favourable" | "unfavourable";
}) {
  return (
    <article className="analytics-panel">
      <h3
        className={`text-lg font-semibold ${
          tone === "favourable" ? "text-emerald-700" : "text-red-700"
        }`}
      >
        {title}
      </h3>
      <div className="mt-4 divide-y">
        {clubs.map((club, index) => (
          <div
            key={club.id}
            className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <span className="font-semibold text-slate-400">{index + 1}</span>
            <div className="min-w-0">
              <Link href={`/clubs/${club.slug}`}>
                <ClubName club={club} size={24} />
              </Link>
              <p className="ml-8 text-xs text-slate-500">{club.leagueName}</p>
            </div>
            <InjuryTotals club={club} />
          </div>
        ))}
      </div>
    </article>
  );
}

function InjuryTotals({ club }: { club: ClubInjuryRow }) {
  return (
    <div className="text-right">
      <p className="font-semibold">{club.gamesMissed} games</p>
      <p className="text-xs text-slate-500">
        {club.daysInjured} days · {club.playersAffected} players
      </p>
    </div>
  );
}
