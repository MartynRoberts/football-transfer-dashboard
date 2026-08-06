import { getLeagueAnalytics } from "@/lib/leagues/get-league-analytics";
import LeagueTransferRankings from "@/components/leagues/LeagueTransferRankings";
import LeagueSquadRankings from "@/components/leagues/LeagueSquadRankings";
import { InjuryProneSquadExtremes } from "@/components/leagues/LeagueInjuryRankings";

export default async function LeagueAnalytics() {
  const data = await getLeagueAnalytics();

  return (
    <div className="page-stack">
      <LeagueTransferRankings finances={data.finances} seasons={data.seasons} />
      <LeagueSquadRankings squads={data.squads} />
      <InjuryProneSquadExtremes
        most={data.mostInjuryProne}
        least={data.leastInjuryProne}
        season={data.injurySeason}
      />
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
