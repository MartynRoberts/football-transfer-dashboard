import Link from "next/link";
import ClubName from "@/components/clubs/ClubName";
import type { ClubDisciplineRow } from "@/lib/leagues/types";

export default function LeagueDisciplineRankings({
  clubs,
  season,
}: {
  clubs: ClubDisciplineRow[];
  season: string;
}) {
  if (clubs.length === 0) {
    return (
      <section>
        <h2 className="section-title">Club discipline rankings</h2>
        <p className="text-slate-500">No disciplinary statistics available.</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="section-title">Club discipline rankings</h2>
      <p className="mb-4 text-sm text-slate-500">
        Best and worst discipline for {season}, ranked by cards per league match
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <Ranking
          title="Most disciplined"
          clubs={clubs.slice(0, 5)}
          favourable
        />
        <Ranking
          title="Least disciplined"
          clubs={[...clubs].reverse().slice(0, 5)}
          favourable={false}
        />
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Match coverage is estimated from player minutes, with appearances used
        when coverage is incomplete.
      </p>
    </section>
  );
}

function Ranking({
  title,
  clubs,
  favourable,
}: {
  title: string;
  clubs: ClubDisciplineRow[];
  favourable: boolean;
}) {
  return (
    <article className="analytics-panel">
      <h3
        className={`text-lg font-semibold ${favourable ? "text-emerald-700" : "text-red-700"}`}
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
            <div className="text-right">
              <p className="font-semibold">
                {club.cardsPerMatch.toFixed(2)} cards
              </p>
              <p className="text-xs text-slate-500">
                {club.yellowCards} yellow · {club.redCards} red
              </p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
