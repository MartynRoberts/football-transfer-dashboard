import SquadAvailabilityDiscipline from "@/components/clubs/SquadAvailabilityDiscipline";
import { getSquadAvailabilityDiscipline } from "@/lib/clubs/getSquadAvailabilityDiscipline";

export default async function ClubAvailabilitySection({
  clubId,
  leagueId,
  leagueName,
  season,
}: {
  clubId: string;
  leagueId: string;
  leagueName: string;
  season: string;
}) {
  const data = await getSquadAvailabilityDiscipline({
    clubId,
    leagueId,
    season,
  });

  if (!data) return null;

  return (
    <SquadAvailabilityDiscipline
      season={season}
      leagueName={leagueName}
      injury={data.injury}
      discipline={data.discipline}
    />
  );
}

export function ClubAvailabilitySkeleton() {
  return (
    <section aria-label="Loading squad availability" className="space-y-4">
      <div className="h-8 w-64 animate-pulse bg-slate-100" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse bg-slate-100" />
        <div className="h-64 animate-pulse bg-slate-100" />
      </div>
    </section>
  );
}
