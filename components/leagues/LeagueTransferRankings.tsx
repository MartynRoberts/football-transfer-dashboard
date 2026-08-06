import LeagueIdentity from "@/components/leagues/LeagueIdentity";
import { formatMoney } from "@/components/leagues/analytics-formatters";
import type { LeagueFinanceRow } from "@/lib/leagues/types";

export default function LeagueTransferRankings({
  finances,
  seasons,
}: {
  finances: LeagueFinanceRow[];
  seasons: string[];
}) {
  const efficient = [...finances].sort(
    (first, second) => second.efficiencyScore - first.efficiencyScore,
  );

  return (
    <div className="grid gap-10 xl:grid-cols-2">
      <section>
        <h2 className="section-title">Biggest spenders by league</h2>
        <p className="mb-4 text-sm text-slate-500">
          {seasons.join(", ")} · Known transfer fees
        </p>
        <div className="analytics-frame overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead className="bg-slate-100 text-left text-sm">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">League</th>
                <th className="p-3 text-right">Spend</th>
                <th className="p-3 text-right">Income</th>
                <th className="p-3 text-right">Net spend</th>
              </tr>
            </thead>
            <tbody>
              {finances.map((league, index) => (
                <tr key={league.id} className="border-t">
                  <td className="p-3 text-slate-400">{index + 1}</td>
                  <td className="p-3">
                    <LeagueIdentity league={league} link />
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {formatMoney(league.totalSpend)}
                  </td>
                  <td className="p-3 text-right">
                    {formatMoney(league.totalIncome)}
                  </td>
                  <td className="p-3 text-right">
                    {formatMoney(league.netSpend)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="section-title">Most efficient spenders by league</h2>
        <p className="mb-4 text-sm text-slate-500">
          Fees compared with player valuations across {seasons.length} seasons
        </p>
        <div className="analytics-frame overflow-x-auto">
          <table className="w-full min-w-[540px]">
            <thead className="bg-slate-100 text-left text-sm">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">League</th>
                <th className="p-3 text-right">Efficiency</th>
                <th className="p-3 text-right">Net spend</th>
              </tr>
            </thead>
            <tbody>
              {efficient.map((league, index) => (
                <tr key={league.id} className="border-t">
                  <td className="p-3 text-slate-400">{index + 1}</td>
                  <td className="p-3">
                    <LeagueIdentity league={league} link />
                  </td>
                  <td
                    className={`p-3 text-right font-semibold ${
                      league.efficiencyScore >= 0
                        ? "text-emerald-700"
                        : "text-red-700"
                    }`}
                  >
                    {formatMoney(league.efficiencyScore)}
                  </td>
                  <td className="p-3 text-right">
                    {formatMoney(league.netSpend)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
