import Link from "next/link";
import ClubName, { type ClubNameData } from "@/components/clubs/ClubName";
import TransferValueRating from "@/components/transfers/TransferValueRating";
import { formatPounds } from "@/lib/currency";

interface ExpensiveTransfer {
  id: string;
  fee: number;
  marketValue: number | null;

  player: {
    name: string;
    slug: string;
  };

  fromClub:
    | (ClubNameData & {
        slug: string;
      })
    | null;

  toClub:
    | (ClubNameData & {
        slug: string;
      })
    | null;
}

export default function MostExpensiveTransfers({
  transfers,
  season,
}: {
  transfers: ExpensiveTransfer[];
  season: string;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="section-title mb-0">Most expensive player transfers</h2>

        <p className="mt-1 text-sm text-slate-500">
          {season} — highest known transfer fees involving top-five league
          clubs.
        </p>
      </div>

      {transfers.length === 0 ? (
        <p className="text-sm text-slate-500">
          No current-season transfer fee data available.
        </p>
      ) : (
        <div className="mobile-card-table overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Player</th>
                <th className="p-3 text-left">From</th>
                <th className="p-3 text-left">To</th>
                <th className="p-3 text-left">Fee</th>
                <th className="p-3 text-left">Valuation</th>
                <th className="min-w-44 p-4 text-left">Value rating</th>
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
                      className="text-brand font-medium hover:underline"
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
                        <ClubName club={transfer.fromClub} />
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
                        <ClubName club={transfer.toClub} />
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td
                    data-label="Fee"
                    className="whitespace-nowrap p-3 font-semibold"
                  >
                    {formatPounds(transfer.fee)}
                  </td>

                  <td data-label="Valuation" className="whitespace-nowrap p-3">
                    {transfer.marketValue === null
                      ? "-"
                      : formatPounds(transfer.marketValue)}
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
