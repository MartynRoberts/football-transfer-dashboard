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

  return (
    <section>
      <h2 className="section-title">Discipline</h2>

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
