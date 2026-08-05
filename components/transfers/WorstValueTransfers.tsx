import Link from "next/link";
import TransferValueRating from "@/components/transfers/TransferValueRating";

interface WorstValueTransfer {
  id: string;
  fee: number;
  marketValue: number;
  valueDifference: number;

  player: {
    name: string;
    slug: string;
  };

  fromClub: {
    name: string;
    slug: string;
  } | null;

  toClub: {
    name: string;
    slug: string;
  } | null;
}

function formatMoney(value: number): string {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1_000_000_000) {
    return `€${(absoluteValue / 1_000_000_000).toFixed(2)}bn`;
  }

  if (absoluteValue >= 1_000_000) {
    return `€${(absoluteValue / 1_000_000).toFixed(1)}m`;
  }

  if (absoluteValue >= 1_000) {
    return `€${(absoluteValue / 1_000).toFixed(1)}k`;
  }

  return `€${absoluteValue.toLocaleString()}`;
}

function formatFee(fee: number): string {
  return fee === 0 ? "Free" : formatMoney(fee);
}

export default function WorstValueTransfers({
  transfers,
  season,
}: {
  transfers: WorstValueTransfer[];
  season: string;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold sm:text-2xl">
          Worst value individual player transfers
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {season} — biggest difference between fee paid and valuation.
        </p>
      </div>

      {transfers.length === 0 ? (
        <p className="text-sm text-slate-500">
          No overpriced current-season transfers available.
        </p>
      ) : (
        <div className="mobile-card-table overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Player</th>
                <th className="p-3 text-left">From</th>
                <th className="p-3 text-left">To</th>
                <th className="p-3 text-left">Fee</th>
                <th className="p-3 text-left">Valuation</th>
                <th className="p-3 text-left">Value lost</th>
                <th className="min-w-44 p-4 text-left">Rating</th>
              </tr>
            </thead>

            <tbody>
              {transfers.map((transfer, index) => (
                <tr key={transfer.id} className="border-b">
                  <td
                    data-label="Rank"
                    className="p-3 font-semibold text-slate-400"
                  >
                    {index + 1}
                  </td>

                  <td data-label="Player" className="p-3">
                    <Link
                      href={`/players/${transfer.player.slug}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {transfer.player.name}
                    </Link>
                  </td>

                  <td data-label="From" className="p-3">
                    {transfer.fromClub ? (
                      <Link
                        href={`/clubs/${transfer.fromClub.slug}`}
                        className="hover:underline"
                      >
                        {transfer.fromClub.name}
                      </Link>
                    ) : (
                      "Free Agent"
                    )}
                  </td>

                  <td data-label="To" className="p-3">
                    {transfer.toClub ? (
                      <Link
                        href={`/clubs/${transfer.toClub.slug}`}
                        className="hover:underline"
                      >
                        {transfer.toClub.name}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td data-label="Fee" className="whitespace-nowrap p-3">
                    {formatFee(transfer.fee)}
                  </td>

                  <td data-label="Valuation" className="whitespace-nowrap p-3">
                    {formatMoney(transfer.marketValue)}
                  </td>

                  <td
                    data-label="Value lost"
                    className="whitespace-nowrap p-3 font-semibold text-red-700"
                  >
                    Worth {formatMoney(transfer.valueDifference)} less than paid
                  </td>

                  <td data-label="Rating" className="min-w-44 p-4">
                    <TransferValueRating
                      fee={transfer.fee}
                      marketValue={transfer.marketValue}
                      perspective="buyer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
