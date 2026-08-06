import Link from "next/link";
import ClubName from "@/components/clubs/ClubName";
import { getLeagueClubInjuryRanking } from "@/lib/leagues/get-league-analytics";
import { CURRENT_SEASON } from "@/lib/sync/scope";

export default async function LeagueClubInjuryAnalytics({
  leagueId,
  leagueName,
}: {
  leagueId: string;
  leagueName: string;
}) {
  const clubs = await getLeagueClubInjuryRanking({ leagueId, leagueName });

  return (
    <section>
      <h2 className="section-title">Clubs ranked by injuries</h2>
      <p className="mb-4 text-sm text-slate-500">
        {CURRENT_SEASON} · Ranked by reported games missed, then days injured
      </p>
      <div className="analytics-frame divide-y">
        {clubs.map((club, index) => (
          <div
            key={club.id}
            className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 p-4"
          >
            <span className="font-semibold text-slate-400">{index + 1}</span>
            <Link href={`/clubs/${club.slug}`} className="min-w-0">
              <ClubName club={club} size={24} />
            </Link>
            <div className="text-right">
              <p className="font-semibold">{club.gamesMissed} games</p>
              <p className="text-xs text-slate-500">
                {club.daysInjured} days · {club.playersAffected} players
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LeagueClubInjuryAnalyticsSkeleton() {
  return <div className="h-96 animate-pulse bg-slate-100" />;
}
