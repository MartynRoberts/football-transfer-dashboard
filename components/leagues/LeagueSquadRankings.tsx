import LeagueIdentity from "@/components/leagues/LeagueIdentity";
import { formatMoney } from "@/components/leagues/analytics-formatters";
import type { LeagueSquadRow } from "@/lib/leagues/types";

export default function LeagueSquadRankings({
  squads,
}: {
  squads: LeagueSquadRow[];
}) {
  const byValue = [...squads].sort(
    (first, second) => second.averageSquadValue - first.averageSquadValue,
  );
  const byAge = [...squads].sort(
    (first, second) => (second.averageAge ?? 0) - (first.averageAge ?? 0),
  );

  return (
    <div className="grid gap-10 xl:grid-cols-2">
      <SquadTable
        title="League average squad values"
        description="Average combined player market value per club"
        squads={byValue}
        value={(league) => formatMoney(league.averageSquadValue)}
      />
      <SquadTable
        title="League average age"
        description="Average age across players with a recorded date of birth"
        squads={byAge}
        value={(league) =>
          league.averageAge === null
            ? "-"
            : `${league.averageAge.toFixed(1)} years`
        }
      />
    </div>
  );
}

function SquadTable({
  title,
  description,
  squads,
  value,
}: {
  title: string;
  description: string;
  squads: LeagueSquadRow[];
  value: (league: LeagueSquadRow) => string;
}) {
  return (
    <section>
      <h2 className="section-title">{title}</h2>
      <p className="mb-4 text-sm text-slate-500">{description}</p>
      <div className="analytics-frame">
        {squads.map((league, index) => (
          <div
            key={league.id}
            className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 border-b p-4 last:border-b-0"
          >
            <span className="font-semibold text-slate-400">{index + 1}</span>
            <LeagueIdentity league={league} link />
            <div className="text-right">
              <p className="font-semibold">{value(league)}</p>
              <p className="text-xs text-slate-500">
                {league.clubCount} clubs · {league.playerCount} players
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
