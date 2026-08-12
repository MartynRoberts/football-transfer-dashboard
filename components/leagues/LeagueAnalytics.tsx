import { getLeagueAnalytics } from "@/lib/leagues/get-league-analytics";
import LeagueTransferRankings from "@/components/leagues/LeagueTransferRankings";
import LeagueSquadRankings from "@/components/leagues/LeagueSquadRankings";
import { InjuryProneSquadExtremes } from "@/components/leagues/LeagueInjuryRankings";

export default async function LeagueAnalytics() {
  const data = await getLeagueAnalytics();

  return (
    <div className="page-stack min-w-0">
      <div id="league-finances" className="section-anchor">
        <LeagueTransferRankings
          finances={data.finances}
          seasons={data.seasons}
        />
      </div>
      <div id="league-squads" className="section-anchor">
        <LeagueSquadRankings squads={data.squads} />
      </div>
      <div id="league-injuries" className="section-anchor">
        <InjuryProneSquadExtremes
          most={data.mostInjuryProne}
          least={data.leastInjuryProne}
          season={data.injurySeason}
        />
      </div>
    </div>
  );
}

export function LeagueAnalyticsSkeleton() {
  return (
    <div
      aria-label="Loading league analytics"
      className="grid gap-10 lg:grid-cols-2"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-72 animate-pulse bg-slate-100" />
      ))}
    </div>
  );
}
