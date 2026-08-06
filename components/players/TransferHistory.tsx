import Link from "next/link";
import ClubName, { type ClubNameData } from "@/components/clubs/ClubName";
import TransferValueRating from "@/components/transfers/TransferValueRating";

interface TransferHistoryItem {
  id: string;
  transferDate: Date | null;
  fee: number | null;
  marketValue: number | null;

  player?: {
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

interface TransferHistoryProps {
  transfers: TransferHistoryItem[];
  title?: string;
  showPlayer?: boolean;
  emptyMessage?: string;
}

function formatFee(fee: number | null): string {
  if (fee === null) {
    return "Undisclosed";
  }

  if (fee === 0) {
    return "Free";
  }

  return `€${fee.toLocaleString()}`;
}

function formatMarketValue(marketValue: number | null): string {
  if (marketValue === null) {
    return "-";
  }

  return `€${marketValue.toLocaleString()}`;
}

export default function TransferHistory({
  transfers,
  title = "Transfer History",
  showPlayer = false,
  emptyMessage = "No transfer history available.",
}: TransferHistoryProps) {
  return (
    <section>
      <h2 className="section-title">{title}</h2>

      {transfers.length === 0 ? (
        <p className="text-gray-500">{emptyMessage}</p>
      ) : (
        <div className="mobile-card-table overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-3 text-left">Date</th>

                {showPlayer && <th className="p-3 text-left">Player</th>}

                <th className="p-3 text-left">From</th>

                <th className="p-3 text-left">To</th>

                <th className="p-3 text-left">Fee</th>

                <th className="p-3 text-left">Market Value</th>

                <th className="min-w-44 p-4 text-left">Value rating</th>
              </tr>
            </thead>

            <tbody>
              {transfers.map((transfer) => (
                <tr key={transfer.id} className="border-b">
                  <td data-label="Date" className="whitespace-nowrap p-3">
                    {transfer.transferDate?.toLocaleDateString("en-GB") ?? "-"}
                  </td>

                  {showPlayer && (
                    <td data-label="Player" className="p-3">
                      {transfer.player ? (
                        <Link
                          href={`/players/${transfer.player.slug}`}
                          className="text-brand font-medium hover:underline"
                        >
                          {transfer.player.name}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
                  )}

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
                      "Free Agent"
                    )}
                  </td>

                  <td data-label="Fee" className="whitespace-nowrap p-3">
                    {formatFee(transfer.fee)}
                  </td>

                  <td
                    data-label="Market value"
                    className="whitespace-nowrap p-3"
                  >
                    {formatMarketValue(transfer.marketValue)}
                  </td>

                  <td data-label="Rating" className="min-w-44 p-4">
                    <TransferValueRating
                      fee={transfer.fee}
                      marketValue={transfer.marketValue}
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
