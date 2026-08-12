import Link from "next/link";
import { Suspense } from "react";
import ClubName from "@/components/clubs/ClubName";
import { formatMoney } from "@/components/leagues/analytics-formatters";
import LeagueClubInjuryAnalytics, {
  LeagueClubInjuryAnalyticsSkeleton,
} from "@/components/leagues/LeagueClubInjuryAnalytics";
import TransferHistory from "@/components/players/TransferHistory";
import MostEfficientClubSpending from "@/components/transfers/MostEfficientClubSpending";
import MostExpensiveTransfers from "@/components/transfers/MostExpensiveTransfers";
import { getLeagueDetailAnalytics } from "@/lib/leagues/get-league-analytics";
import { getClubDisciplineRanking } from "@/lib/leagues/get-league-analytics";
import LeagueDisciplineRankings from "@/components/leagues/LeagueDisciplineRankings";
import { CURRENT_SEASON } from "@/lib/sync/scope";

type AnalyticsData = Awaited<ReturnType<typeof getLeagueDetailAnalytics>>;
type ClubRow = AnalyticsData["clubs"][number];

export default async function LeagueDetailAnalytics({
  leagueId,
  leagueName,
}: {
  leagueId: string;
  leagueName: string;
}) {
  const [data, discipline] = await Promise.all([
    getLeagueDetailAnalytics(leagueId),
    getClubDisciplineRanking(leagueId),
  ]);
  const bySpend = descending(data.clubs, (club) => club.totalSpend);
  const byNetSpend = descending(data.clubs, (club) => club.netSpend);
  const byValue = descending(data.clubs, (club) => club.squadValue);
  const byIncoming = descending(data.clubs, (club) => club.incomingCount);
  const byOutgoing = descending(data.clubs, (club) => club.outgoingCount);
  const withAge = data.clubs.filter(
    (club): club is ClubRow & { averageAge: number } =>
      club.averageAge !== null,
  );

  return (
    <div className="contents">
      <div id="latest-transfers" className="section-anchor">
        <TransferHistory
          transfers={data.latestTransfers}
          title="10 latest transfers for this league"
          showPlayer
          emptyMessage="No current-season transfers available."
        />
      </div>

      <div id="finances" className="section-anchor page-stack">
        <div className="grid gap-10 xl:grid-cols-2">
          <ClubRanking
            title="Biggest spenders"
            description={`${data.season} · Total incoming player spend from known fees`}
            clubs={bySpend}
            value={(club) => formatMoney(club.totalSpend)}
            detail={(club) => `${club.incomingCount} arrivals`}
          />
          <ClubRanking
            title="Net spend ranked"
            description={`${data.season} · Incoming spend less transfer income`}
            clubs={byNetSpend}
            value={(club) => formatMoney(club.netSpend)}
            detail={(club) =>
              `${formatMoney(club.totalSpend)} spent · ${formatMoney(club.totalIncome)} received`
            }
          />
        </div>
        <MostEfficientClubSpending
          clubs={data.efficientClubs}
          seasons={data.efficiencySeasons}
        />
        <MostExpensiveTransfers
          transfers={data.expensiveTransfers}
          season={data.season}
        />
      </div>

      <div id="squads" className="section-anchor grid gap-10 xl:grid-cols-2">
        <ClubRanking
          title="Ranked squad valuations"
          description="Combined current market value of players in each squad"
          clubs={byValue}
          value={(club) => formatMoney(club.squadValue)}
          detail={(club) => `${club.playerCount} players`}
        />
        <ClubRanking
          title="Most incoming transfers"
          description={`${data.season} · All recorded arrivals`}
          clubs={byIncoming}
          value={(club) => club.incomingCount.toLocaleString()}
          detail={() => "arrivals"}
        />
        <ClubRanking
          title="Most outgoing transfers"
          description={`${data.season} · All recorded departures`}
          clubs={byOutgoing}
          value={(club) => club.outgoingCount.toLocaleString()}
          detail={() => "departures"}
        />
        <ClubRanking
          title="Squad ages ranked"
          description="Average age of players with a recorded date of birth"
          clubs={descending(withAge, (club) => club.averageAge)}
          value={(club) => `${club.averageAge.toFixed(1)} years`}
          detail={(club) => `${club.playerCount} players`}
        />
      </div>

      <div id="availability" className="section-anchor">
        <Suspense fallback={<LeagueClubInjuryAnalyticsSkeleton />}>
          <LeagueClubInjuryAnalytics
            leagueId={leagueId}
            leagueName={leagueName}
          />
        </Suspense>
      </div>

      <div id="discipline" className="section-anchor">
        <LeagueDisciplineRankings clubs={discipline} season={CURRENT_SEASON} />
      </div>
    </div>
  );
}

function descending<T>(items: T[], value: (item: T) => number): T[] {
  return [...items].sort((first, second) => value(second) - value(first));
}

function ClubRanking<T extends ClubRow>({
  title,
  description,
  clubs,
  value,
  detail,
}: {
  title: string;
  description: string;
  clubs: T[];
  value: (club: T) => string;
  detail: (club: T) => string;
}) {
  return (
    <section>
      <h2 className="section-title">{title}</h2>
      <p className="mb-4 text-sm text-slate-500">{description}</p>
      <div className="analytics-frame">
        {clubs.map((club, index) => (
          <div
            key={club.id}
            className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 border-b p-4 last:border-b-0"
          >
            <span className="font-semibold text-slate-400">{index + 1}</span>
            <Link href={`/clubs/${club.slug}`} className="min-w-0">
              <ClubName club={club} size={24} />
            </Link>
            <div className="text-right">
              <p className="font-semibold">{value(club)}</p>
              <p className="text-xs text-slate-500">{detail(club)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LeagueDetailAnalyticsSkeleton() {
  return <div className="h-[48rem] animate-pulse bg-slate-100" />;
}
