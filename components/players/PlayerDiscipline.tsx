import type { SeasonPerformance } from "@/lib/players/types";

export default function PlayerDiscipline({
  seasons,
}: {
  seasons: SeasonPerformance[];
}) {
  if (seasons.length === 0) {
    return (
      <section>
        <h2 className="section-title">Discipline</h2>
        <p className="text-slate-500">No disciplinary statistics available.</p>
      </section>
    );
  }

  const career = seasons.reduce(
    (totals, season) => ({
      appearances: totals.appearances + season.appearances,
      minutesPlayed: totals.minutesPlayed + season.minutesPlayed,
      yellowCards: totals.yellowCards + season.yellowCards,
      redCards: totals.redCards + season.redCards,
    }),
    { appearances: 0, minutesPlayed: 0, yellowCards: 0, redCards: 0 },
  );
  const careerCards = career.yellowCards + career.redCards;

  return (
    <section>
      <h2 className="section-title">Discipline</h2>
      <p className="mb-4 text-sm text-slate-500">
        Yellow and red cards from recorded appearances
      </p>

      <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <DisciplineCard
          label="Career yellow cards"
          value={career.yellowCards}
        />
        <DisciplineCard label="Career red cards" value={career.redCards} />
        <DisciplineCard
          label="Cards per appearance"
          value={
            career.appearances > 0
              ? (careerCards / career.appearances).toFixed(2)
              : "-"
          }
        />
        <DisciplineCard
          label="Cards per 90"
          value={
            career.minutesPlayed > 0
              ? ((careerCards * 90) / career.minutesPlayed).toFixed(2)
              : "-"
          }
        />
      </div>

      <div className="mobile-card-table overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-3 text-left">Season</th>
              <th className="p-3 text-left">Appearances</th>
              <th className="p-3 text-left">Yellow cards</th>
              <th className="p-3 text-left">Red cards</th>
              <th className="p-3 text-left">Cards / appearance</th>
              <th className="p-3 text-left">Cards / 90</th>
            </tr>
          </thead>
          <tbody>
            {seasons.map((season) => (
              <tr key={season.season} className="border-b">
                <td data-label="Season" className="p-3 font-medium">
                  {season.season}
                </td>
                <td data-label="Appearances" className="p-3">
                  {season.appearances}
                </td>
                <td data-label="Yellow cards" className="p-3">
                  {season.yellowCards}
                </td>
                <td data-label="Red cards" className="p-3">
                  {season.redCards}
                </td>
                <td data-label="Cards / appearance" className="p-3">
                  {season.cardsPerAppearance?.toFixed(2) ?? "-"}
                </td>
                <td data-label="Cards / 90" className="p-3">
                  {season.cardsPer90}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DisciplineCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="analytics-panel">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
