import Link from "next/link";
import ClubName from "@/components/clubs/ClubName";
import { formatPounds } from "@/lib/currency";

interface TopClubSpender {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  leagueName: string | null;
  totalSpend: number;
  signingCount: number;
}

export default function TopClubSpenders({
  clubs,
  season,
}: {
  clubs: TopClubSpender[];
  season: string;
}) {
  const maximumSpend = Math.max(...clubs.map((club) => club.totalSpend), 1);

  return (
    <section>
      <div className="mb-4">
        <h2 className="section-title mb-0">Top 10 biggest spenders</h2>

        <p className="mt-1 text-sm text-slate-500">
          {season} season, based on known transfer fees.
        </p>
      </div>

      {clubs.length === 0 ? (
        <p className="text-sm text-slate-500">
          No current-season spending data available.
        </p>
      ) : (
        <div className="analytics-frame">
          {clubs.map((club, index) => {
            const width = (club.totalSpend / maximumSpend) * 100;

            return (
              <div
                key={club.id}
                className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2 border-b p-3 last:border-b-0 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:gap-3 sm:p-4"
              >
                <span className="text-sm font-bold text-slate-400">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <Link
                      href={`/clubs/${club.slug}`}
                      className="text-brand truncate font-semibold hover:underline"
                    >
                      <ClubName club={club} size={24} />
                    </Link>

                    <span className="shrink-0 font-bold">
                      {formatPounds(club.totalSpend)}
                    </span>
                  </div>

                  <div className="mt-1 flex justify-between gap-3 text-xs text-slate-500">
                    <span className="truncate">
                      {club.leagueName ?? "Unknown league"}
                    </span>

                    <span className="shrink-0">
                      {club.signingCount}{" "}
                      {club.signingCount === 1 ? "signing" : "signings"}
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="bg-brand h-full rounded-full"
                      style={{
                        width: `${Math.max(width, 2)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
