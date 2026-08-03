import { notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

import Image from "next/image";

import MarketValueChart from "@/components/players/MarketValueChart";
import MarketValuePercentile from "@/components/players/MarketValuePercentile";

import { percentage } from "@/app/utils/percentage";

interface PlayerPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function ordinal(value: number) {
  const remainder100 = value % 100;

  if (remainder100 >= 11 && remainder100 <= 13) {
    return `${value}th`;
  }

  return `${value}${value % 10 === 1 ? "st" : value % 10 === 2 ? "nd" : value % 10 === 3 ? "rd" : "th"}`;
}

function pluralizePosition(position: string) {
  const labels: Record<string, string> = {
    "attacking midfield": "attacking midfielders",
    "central midfield": "central midfielders",
    "defensive midfield": "defensive midfielders",
    goalkeeper: "goalkeepers",
  };
  const normalized = position.toLowerCase();

  return labels[normalized] ?? `${normalized}s`;
}

function HeightPercentile({
  value,
  comparison,
}: {
  value: number;
  comparison: string;
}) {
  const boundedValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <div
          className="relative h-2 flex-1 rounded-full bg-slate-200"
          role="progressbar"
          aria-label={`Height: ${ordinal(boundedValue)} percentile`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={boundedValue}
        >
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${boundedValue}%` }}
          />
          <span
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 shadow-sm"
            style={{ left: `${boundedValue}%` }}
          />
        </div>
        <span className="min-w-28 text-sm font-semibold">
          {ordinal(boundedValue)} percentile
        </span>
      </div>
      <p className="text-sm text-slate-500">
        Taller than {boundedValue}% of {comparison}
      </p>
    </div>
  );
}

function per90(total: number, minutesPlayed: number): string {
  if (minutesPlayed <= 0) {
    return "0.00";
  }

  return ((total * 90) / minutesPlayed).toFixed(2);
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params;

  const player = await prisma.player.findUnique({
    where: {
      slug,
    },
    include: {
      currentClub: {
        include: {
          league: true,
        },
      },
      stats: {
        orderBy: {
          season: "desc",
        },
      },
      transfers: {
        include: {
          fromClub: true,
          toClub: true,
        },
        orderBy: {
          transferDate: "desc",
        },
      },
      marketValueHistories: {
        orderBy: {
          date: "desc",
        },
      },
      injuries: {
        orderBy: {
          startDate: "desc",
        },
      },
      metric: true,
    },
  });

  if (!player) {
    notFound();
  }

  const secondaryPositions = Array.isArray(player.secondaryPositions)
    ? player.secondaryPositions.filter(
        (position): position is string => typeof position === "string",
      )
    : typeof player.secondaryPositions === "string"
      ? [player.secondaryPositions]
      : [];

  const marketValueChartData = player.marketValueHistories
    .slice()
    .sort((first, second) => first.date.getTime() - second.date.getTime())
    .map((history) => ({
      date: history.date.toISOString(),
      marketValue: history.marketValue,
      clubName: history.clubName,
    }));

  const currentClubTransfermarktId =
    player.currentClub?.transfermarktId ?? null;

  const currentClubStats = currentClubTransfermarktId
    ? player.stats.filter((stat) => stat.clubId === currentClubTransfermarktId)
    : [];

  const statsBySeason = Object.values(
    currentClubStats.reduce<
      Record<
        string,
        {
          season: string;
          appearances: number;
          minutesPlayed: number;
          goals: number;
          assists: number;
        }
      >
    >((seasons, stat) => {
      const existing = seasons[stat.season] ?? {
        season: stat.season,
        appearances: 0,
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
      };

      existing.appearances += stat.appearances;
      existing.minutesPlayed += stat.minutesPlayed;
      existing.goals += stat.goals;
      existing.assists += stat.assists;

      seasons[stat.season] = existing;

      return seasons;
    }, {}),
  ).sort((first, second) => second.season.localeCompare(first.season));

  const playerStatScopes = currentClubStats.map((stat) => ({
    season: stat.season,
    clubId: stat.clubId,
    competitionId: stat.competitionId,
  }));

  const uniquePlayerStatScopes = Array.from(
    new Map(
      playerStatScopes.map((scope) => [
        `${scope.season}:${scope.clubId}:${scope.competitionId}`,
        scope,
      ]),
    ).values(),
  );

  const teamPlayerStats =
    uniquePlayerStatScopes.length > 0
      ? await prisma.playerStat.findMany({
          where: {
            OR: uniquePlayerStatScopes.map((scope) => ({
              season: scope.season,
              clubId: scope.clubId,
              competitionId: scope.competitionId,
            })),
          },
          select: {
            season: true,
            clubId: true,
            competitionId: true,
            goals: true,
          },
        })
      : [];

  const teamGoalsByScope = teamPlayerStats.reduce<Record<string, number>>(
    (totals, stat) => {
      const key = `${stat.season}:${stat.clubId}:${stat.competitionId}`;

      totals[key] = (totals[key] ?? 0) + stat.goals;

      return totals;
    },
    {},
  );

  const goalInvolvementBySeason = Object.fromEntries(
    statsBySeason.map((seasonStats) => {
      const seasonPlayerStats = currentClubStats.filter(
        (stat) => stat.season === seasonStats.season,
      );

      const teamGoals = seasonPlayerStats.reduce((total, stat) => {
        const key = `${stat.season}:${stat.clubId}:${stat.competitionId}`;

        return total + (teamGoalsByScope[key] ?? 0);
      }, 0);

      const goalContributions = seasonStats.goals + seasonStats.assists;

      return [
        seasonStats.season,
        {
          teamGoals,
          goalContributions,
          percentage: percentage(goalContributions, teamGoals),
        },
      ];
    }),
  ) as Record<
    string,
    {
      teamGoals: number;
      goalContributions: number;
      percentage: number | null;
    }
  >;

  return (
    <main className="container mx-auto px-4 py-8 space-y-10">
      <div className="flex justify-between">
        <section className="flex items-center gap-6">
          {player.imageUrl && (
            <Image
              src={player.imageUrl}
              alt={player.name}
              width={180}
              height={240}
              className="rounded-lg object-cover"
            />
          )}

          <div>
            <h1 className="text-4xl font-bold">
              {player.shirtNumber != null ? `#${player.shirtNumber} ` : ""}{" "}
              {player.name}
            </h1>

            <div className="text-gray-500 mt-2">
              <p>{player.position ?? "Unknown position"}</p>

              {secondaryPositions.map((position) => (
                <p key={position} className="text-sm text-slate-500">
                  {position}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Club / contract */}
        <section className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Current Club</div>

            {player.currentClub ? (
              <Link
                href={`/clubs/${player.currentClub.slug}`}
                className="text-blue-600 hover:underline text-xl font-semibold"
              >
                {player.currentClub.name}
              </Link>
            ) : (
              "-"
            )}
          </div>

          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Contract Until</div>

            <div className="text-xl font-semibold">
              {player.contract ? player.contract.toLocaleDateString() : "-"}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Joined Club</div>

            <div className="text-xl font-semibold">
              {player.joinedOn ? player.joinedOn.toLocaleDateString() : "-"}
            </div>
          </div>
        </section>
      </div>

      {/* Profile cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Nationality</div>
          <div className="text-xl font-semibold">
            {player.nationality ?? "-"}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Preferred Foot</div>
          <div className="text-xl font-semibold">{player.foot ?? "-"}</div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Height</div>
          <div className="text-xl font-semibold">
            {player.height ? `${player.height} cm` : "-"}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Market Value</div>

          <div className="text-xl font-semibold">
            {player.marketValue !== null
              ? `€${player.marketValue.toLocaleString()}`
              : "-"}
          </div>
        </div>
      </section>

      {player.height !== null &&
        player.metric &&
        (player.metric.heightPercentilePosition !== null ||
          player.metric.heightPercentileOverall !== null) && (
          <section className="rounded-lg border p-5">
            <h2 className="mb-4 text-lg font-semibold">Height percentile</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {player.metric.heightPercentilePosition !== null &&
                player.position && (
                  <HeightPercentile
                    value={player.metric.heightPercentilePosition}
                    comparison={pluralizePosition(player.position)}
                  />
                )}
              {player.metric.heightPercentileOverall !== null && (
                <HeightPercentile
                  value={player.metric.heightPercentileOverall}
                  comparison="top-five-league first-team players"
                />
              )}
            </div>
          </section>
        )}

      {player.metric && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Appearances</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border p-4">
              <div className="text-sm text-slate-500">Appearances</div>
              <div className="mt-1 text-2xl font-semibold">
                {player.metric.appearances?.toLocaleString() ?? "-"}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-sm text-slate-500">Minutes played</div>
              <div className="mt-1 text-2xl font-semibold">
                {player.metric.minutesPlayed?.toLocaleString() ?? "-"}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-sm text-slate-500">Club minutes rank</div>
              <div className="mt-1 text-2xl font-semibold">
                {player.metric.clubMinutesRank !== null
                  ? ordinal(player.metric.clubMinutesRank)
                  : "-"}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-sm text-slate-500">League minutes rank</div>
              <div className="mt-1 text-2xl font-semibold">
                {player.metric.leagueMinutesRank !== null
                  ? ordinal(player.metric.leagueMinutesRank)
                  : "-"}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-sm text-slate-500">
                Position minutes rank
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {player.metric.positionMinutesRank !== null
                  ? ordinal(player.metric.positionMinutesRank)
                  : "-"}
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Goals and Assists</h2>

        {statsBySeason.length === 0 ? (
          <p className="text-slate-500">No seasonal statistics available.</p>
        ) : (
          <div className="space-y-4">
            {statsBySeason.map((season) => {
              const involvement = goalInvolvementBySeason[season.season];

              return (
                <div key={season.season} className="rounded-lg border p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{season.season}</h3>

                    <span className="text-sm text-slate-500">
                      {season.appearances} appearances ·{" "}
                      {season.minutesPlayed.toLocaleString()} minutes
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-lg bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">Goals</div>
                      <div className="mt-1 text-2xl font-semibold">
                        {season.goals}
                      </div>
                      <div className="text-sm text-slate-500">
                        {per90(season.goals, season.minutesPlayed)} /90
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">Assists</div>
                      <div className="mt-1 text-2xl font-semibold">
                        {season.assists}
                      </div>
                      <div className="text-sm text-slate-500">
                        {per90(season.assists, season.minutesPlayed)} /90
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">
                        Goal contributions
                      </div>
                      <div className="mt-1 text-2xl font-semibold">
                        {season.goals + season.assists}
                      </div>
                      <div className="text-sm text-slate-500">
                        {per90(
                          season.goals + season.assists,
                          season.minutesPlayed,
                        )}{" "}
                        /90
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">
                        Minutes per contribution
                      </div>
                      <div className="mt-1 text-2xl font-semibold">
                        {season.goals + season.assists > 0
                          ? Math.round(
                              season.minutesPlayed /
                                (season.goals + season.assists),
                            ).toLocaleString()
                          : "-"}
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">
                        Team goal involvement
                      </div>
                      <div className="mt-1 text-2xl font-semibold">
                        {involvement?.percentage !== null &&
                        involvement?.percentage !== undefined
                          ? `${involvement.percentage}%`
                          : "-"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {involvement
                          ? `${involvement.goalContributions} of ${involvement.teamGoals} team goals`
                          : "No team total available"}
                      </div>

                      {involvement?.percentage !== null &&
                        involvement?.percentage !== undefined && (
                          <div
                            className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
                            role="progressbar"
                            aria-label={`${season.season} team goal involvement`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.min(
                              involvement.percentage,
                              100,
                            )}
                          >
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{
                                width: `${Math.min(
                                  involvement.percentage,
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Transfer history */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Transfer History</h2>

        {player.transfers.length === 0 ? (
          <p className="text-gray-500">No transfer history available.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">From</th>
                <th className="p-3 text-left">To</th>
                <th className="p-3 text-left">Fee</th>
                <th className="p-3 text-left">Market Value</th>
              </tr>
            </thead>

            <tbody>
              {player.transfers.map((transfer) => (
                <tr key={transfer.id} className="border-b">
                  <td className="p-3">
                    {transfer.transferDate
                      ? transfer.transferDate.toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-3">{transfer.fromClub?.name ?? "-"}</td>

                  <td className="p-3">{transfer.toClub?.name ?? "-"}</td>

                  <td className="p-3">
                    {transfer.fee
                      ? `€${transfer.fee.toLocaleString()}`
                      : "Free"}
                  </td>

                  <td className="p-3">
                    {transfer.marketValue
                      ? `€${transfer.marketValue.toLocaleString()}`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Market value */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Market Value History</h2>

        {player.marketValueHistories.length === 0 ? (
          <p className="text-gray-500">No market values recorded.</p>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border p-4 md:p-6">
              <MarketValueChart data={marketValueChartData} />
            </div>

            {player.metric &&
              (player.metric.marketValuePercentileWorldwide !== null ||
                player.metric.marketValuePercentileLeague !== null ||
                player.metric.marketValuePercentilePosition !== null) && (
                <div className="rounded-lg border p-5">
                  <h3 className="mb-5 text-lg font-semibold">
                    Market value percentile
                  </h3>

                  <div className="space-y-5">
                    {player.metric.marketValuePercentileWorldwide !== null && (
                      <MarketValuePercentile
                        label="Worldwide"
                        value={player.metric.marketValuePercentileWorldwide}
                        description="Compared with all tracked players"
                      />
                    )}

                    {player.metric.marketValuePercentileLeague !== null && (
                      <MarketValuePercentile
                        label={
                          player.currentClub?.league?.name ?? "Current league"
                        }
                        value={player.metric.marketValuePercentileLeague}
                        description="Compared with players in this league"
                      />
                    )}

                    {player.metric.marketValuePercentilePosition !== null && (
                      <MarketValuePercentile
                        label="Position"
                        value={player.metric.marketValuePercentilePosition}
                        description={
                          player.position
                            ? `Compared with ${pluralizePosition(
                                player.position,
                              )}`
                            : "Compared with players in this position"
                        }
                      />
                    )}
                  </div>
                </div>
              )}

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Value</th>
                    <th className="p-3 text-left">Club</th>
                  </tr>
                </thead>

                <tbody>
                  {player.marketValueHistories.map((value) => (
                    <tr key={value.id} className="border-b last:border-b-0">
                      <td className="p-3">{value.date.toLocaleDateString()}</td>

                      <td className="p-3 font-medium">
                        €{value.marketValue.toLocaleString()}
                      </td>

                      <td className="p-3">{value.clubName ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Injuries */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Injury History</h2>

        {player.injuries.length === 0 ? (
          <p className="text-gray-500">No injury records.</p>
        ) : (
          <table className="w-full border">
            <tbody>
              {player.injuries.map((injury) => (
                <tr key={injury.id} className="border-b">
                  <td className="p-3">{injury.description ?? "-"}</td>

                  <td className="p-3">
                    {injury.startDate
                      ? injury.startDate.toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-3">
                    {injury.expectedReturn
                      ? injury.expectedReturn.toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
