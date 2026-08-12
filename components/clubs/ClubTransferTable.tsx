import Link from "next/link";
import ClubName, { type ClubNameData } from "@/components/clubs/ClubName";
import TransferValueRating from "@/components/transfers/TransferValueRating";

interface ClubTransfer {
  id: string;
  fee: number | null;
  transferType: string | null;
  marketValue: number | null;
  player: {
    name: string;
    slug: string;
  };
  fromClub: ClubNameData | null;
  toClub: ClubNameData | null;
}

function TransferFee({
  fee,
  transferType,
}: {
  fee: number | null;
  transferType: string | null;
}) {
  if (fee === null) {
    return transferType
      ? `${transferType.charAt(0).toUpperCase()}${transferType.slice(1)}`
      : "Undisclosed";
  }
  if (fee === 0) return "Free";
  return `€${fee.toLocaleString()}`;
}

function MarketValue({ marketValue }: { marketValue: number | null }) {
  return marketValue === null ? "-" : `€${marketValue.toLocaleString()}`;
}

export default function ClubTransferTable({
  direction,
  transfers,
}: {
  direction: "incoming" | "outgoing";
  transfers: ClubTransfer[];
}) {
  const incoming = direction === "incoming";
  const title = incoming ? "Incoming Transfers" : "Outgoing Transfers";

  return (
    <section>
      <h2 className="section-title">{title}</h2>

      {transfers.length === 0 ? (
        <p className="text-gray-500">No {direction} transfers.</p>
      ) : (
        <div className="mobile-card-table overflow-x-auto">
          <table className="w-full table-fixed border sm:min-w-[920px]">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
            </colgroup>
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="px-4 py-3 text-left">Player</th>
                <th className="px-4 py-3 text-left">From</th>
                <th className="px-4 py-3 text-left">To</th>
                <th className="whitespace-nowrap px-5 py-3 text-left">Fee</th>
                <th className="whitespace-nowrap px-5 py-3 text-left">
                  Market Value
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-left">
                  {incoming ? "Value rating" : "Sale rating"}
                </th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => (
                  <tr key={transfer.id} className="border-b">
                    <td data-label="Player" className="min-w-0 px-4 py-3">
                      <Link
                        href={`/players/${transfer.player.slug}`}
                        className="text-brand block truncate hover:underline"
                        title={transfer.player.name}
                      >
                        {transfer.player.name}
                      </Link>
                    </td>
                    <td
                      data-label="From"
                      className="px-4 py-3"
                      title={transfer.fromClub?.name ?? "Free Agent"}
                    >
                      {transfer.fromClub ? (
                        <ClubName club={transfer.fromClub} />
                      ) : (
                        "Free Agent"
                      )}
                    </td>
                    <td
                      data-label="To"
                      className="px-4 py-3"
                      title={transfer.toClub?.name ?? "Free Agent"}
                    >
                      {transfer.toClub ? (
                        <ClubName club={transfer.toClub} />
                      ) : (
                        "Free Agent"
                      )}
                    </td>
                    <td
                      data-label="Fee"
                      className="whitespace-nowrap px-5 py-3 tabular-nums"
                    >
                      <TransferFee
                        fee={transfer.fee}
                        transferType={transfer.transferType}
                      />
                    </td>
                    <td
                      data-label="Market value"
                      className="whitespace-nowrap px-5 py-3 tabular-nums"
                    >
                      <MarketValue marketValue={transfer.marketValue} />
                    </td>
                    <td data-label="Rating" className="px-5 py-3">
                      <div className="min-w-[150px]">
                        <TransferValueRating
                          fee={transfer.fee}
                          marketValue={transfer.marketValue}
                          transferType={transfer.transferType}
                          perspective={incoming ? "buyer" : "seller"}
                        />
                      </div>
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
