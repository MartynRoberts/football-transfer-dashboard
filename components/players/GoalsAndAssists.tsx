import type { ReactNode } from "react";

import type { SeasonPerformance } from "@/lib/players/types";
import { formatRank } from "@/utils/formatRank";

export default function GoalsAndAssists({
  seasons,
}: {
  seasons: SeasonPerformance[];
}) {
  return (
    <section>
      <h2 className="section-title">Goals and Assists</h2>
      {seasons.length === 0 ? (
        <p className="text-slate-500">No seasonal statistics available.</p>
      ) : (
        <div className="space-y-4">
          {seasons.map((season) => (
            <div key={season.season} className="analytics-panel">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{season.season}</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <PerformanceCard
                  label="Goals"
                  value={season.goals}
                  detail={`${season.goalsPer90} /90`}
                />
                <PerformanceCard
                  label="Assists"
                  value={season.assists}
                  detail={`${season.assistsPer90} /90`}
                />
                <PerformanceCard
                  label="Goal contributions"
                  value={season.involvement.goalContributions}
                  detail={`${season.contributionsPer90} /90`}
                />
                <PerformanceCard
                  label="Minutes per contribution"
                  value={season.minutesPerContribution?.toLocaleString() ?? "-"}
                />
                <PerformanceCard
                  label="Goals rank in league"
                  value={formatRank(
                    season.rankings.leaguePositionGoals.rank,
                    season.rankings.leaguePositionGoals.total,
                  )}
                  detail="Players in the same position"
                />

                <PerformanceCard
                  label="Assists rank in league"
                  value={formatRank(
                    season.rankings.leaguePositionAssists.rank,
                    season.rankings.leaguePositionAssists.total,
                  )}
                  detail="Players in the same position"
                />

                <PerformanceCard
                  label="Goals rank in top five leagues"
                  value={formatRank(
                    season.rankings.topFivePositionGoals.rank,
                    season.rankings.topFivePositionGoals.total,
                  )}
                  detail="Players in the same position"
                />

                <PerformanceCard
                  label="Assists rank in top five leagues"
                  value={formatRank(
                    season.rankings.topFivePositionAssists.rank,
                    season.rankings.topFivePositionAssists.total,
                  )}
                  detail="Players in the same position"
                />
                {/* COMMENT OUT UNTIL FIX IMPLEMENTED FOR TOAL TEAM GOALS */}
                {/*}
                <div className="bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">
                    Team goal involvement
                  </div>
                  <div className="mt-1 text-2xl font-semibold">
                    {season.involvement.percentage !== null
                      ? `${season.involvement.percentage}%`
                      : "-"}
                  </div>
                  <div className="text-sm text-slate-500">
                    {season.involvement.goalContributions} of{" "}
                    {season.involvement.teamGoals} team goals
                  </div>
                  {season.involvement.percentage !== null && (
                    <div
                      className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
                      role="progressbar"
                      aria-label={`${season.season} team goal involvement`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.min(
                        season.involvement.percentage,
                        100,
                      )}
                    >
                      <div
                        className="bg-brand h-full rounded-full"
                        style={{
                          width: `${Math.min(season.involvement.percentage, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
                */}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PerformanceCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
}) {
  return (
    <div className="bg-slate-50 p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {detail && <div className="text-sm text-slate-500">{detail}</div>}
    </div>
  );
}
