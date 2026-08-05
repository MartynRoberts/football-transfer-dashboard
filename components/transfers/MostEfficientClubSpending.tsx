import Link from "next/link";

interface EfficientClub {
  id: string;
  name: string;
  slug: string;
  leagueName: string | null;

  netSpend: number;
  efficiencyScore: number;
  purchaseValue: number;
  saleValue: number;
  ratedDeals: number;
}

function formatMoney(value: number): string {
  const absoluteValue = Math.abs(value);

  let formatted: string;

  if (absoluteValue >= 1_000_000_000) {
    formatted = `€${(absoluteValue / 1_000_000_000).toFixed(2)}bn`;
  } else if (absoluteValue >= 1_000_000) {
    formatted = `€${(absoluteValue / 1_000_000).toFixed(1)}m`;
  } else if (absoluteValue >= 1_000) {
    formatted = `€${(absoluteValue / 1_000).toFixed(1)}k`;
  } else {
    formatted = `€${absoluteValue.toLocaleString()}`;
  }

  return value < 0 ? `-${formatted}` : formatted;
}

function ValueComparison({ value }: { value: number }) {
  if (value === 0) {
    return <strong className="text-slate-600">Worth the same as paid</strong>;
  }

  const isGood = value > 0;

  return (
    <strong className={isGood ? "text-emerald-700" : "text-red-700"}>
      Worth {formatMoney(Math.abs(value))} {isGood ? "more" : "less"} than paid
    </strong>
  );
}

function BuyingValueComparison({ value }: { value: number }) {
  if (value === 0) {
    return <strong className="text-slate-600">Worth the same as paid</strong>;
  }

  const isGood = value > 0;

  return (
    <strong className={isGood ? "text-emerald-700" : "text-red-700"}>
      Worth {formatMoney(Math.abs(value))} {isGood ? "more" : "less"} than paid
    </strong>
  );
}

function SellingValueComparison({ value }: { value: number }) {
  if (value === 0) {
    return (
      <strong className="text-slate-600">Worth the same as received</strong>
    );
  }

  const isGood = value > 0;

  return (
    <strong className={isGood ? "text-emerald-700" : "text-red-700"}>
      Worth {formatMoney(Math.abs(value))} {isGood ? "less" : "more"} than
      received
    </strong>
  );
}

export default function MostEfficientClubSpending({
  clubs,
  seasons,
}: {
  clubs: EfficientClub[];
  seasons: string[];
}) {
  const maximumScore = Math.max(
    ...clubs.map((club) => Math.max(club.efficiencyScore, 0)),
    1,
  );

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold sm:text-2xl">
          Most efficient club spending
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {seasons.join(", ")} — transfer fees compared with valuations.
        </p>
      </div>

      {clubs.length === 0 ? (
        <p className="text-sm text-slate-500">
          No comparable transfer data available.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          {clubs.map((club, index) => {
            const barWidth =
              club.efficiencyScore > 0
                ? Math.max((club.efficiencyScore / maximumScore) * 100, 2)
                : 0;

            return (
              <div
                key={club.id}
                className="border-b p-3 last:border-b-0 sm:p-4"
              >
                <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-start gap-2 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:gap-3">
                  <span className="text-sm font-bold text-slate-400">
                    {index + 1}
                  </span>

                  <div className="min-w-0">
                    <Link
                      href={`/clubs/${club.slug}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {club.name}
                    </Link>

                    <p className="text-xs text-slate-500">
                      {club.leagueName ?? "Unknown league"}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="font-bold">
                      +{formatMoney(club.efficiencyScore)}
                    </div>

                    <div className="text-xs text-slate-500">efficiency</div>
                  </div>
                </div>

                <div className="ml-8 mt-3 h-2 overflow-hidden rounded-full bg-slate-100 sm:ml-11">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{
                      width: `${barWidth}%`,
                    }}
                  />
                </div>

                <div className="ml-8 mt-3 grid grid-cols-1 gap-2 text-xs text-slate-500 sm:ml-11 sm:grid-cols-2 sm:gap-3">
                  <span>
                    Buying: <BuyingValueComparison value={club.purchaseValue} />
                  </span>

                  <span>
                    Selling: <SellingValueComparison value={club.saleValue} />
                  </span>

                  {/*
                  <span>
                    Rated deals:{" "}
                    <strong className="text-slate-700">
                      {club.ratedDeals}
                    </strong>
                  </span>
                  */}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
