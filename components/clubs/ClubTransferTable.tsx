import Link from "next/link";
import TransferValueRating from "@/components/transfers/TransferValueRating";

interface ClubTransfer {
  id: string;
  fee: number | null;
  marketValue: number | null;
  player: {
    name: string;
    slug: string;
  };
  fromClub?: { name: string } | null;
  toClub?: { name: string } | null;
}

function TransferFee({ fee }: { fee: number | null }) {
  if (fee === null) return "Undisclosed";
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
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>

      {transfers.length === 0 ? (
        <p className="text-gray-500">No {direction} transfers.</p>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[920px] table-fixed border">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[20%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[22%]" />
            </colgroup>
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left">Player</th>
                <th className="px-4 py-3 text-left">
                  {incoming ? "From" : "To"}
                </th>
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
              {transfers.map((transfer) => {
                const otherClub = incoming
                  ? transfer.fromClub
                  : transfer.toClub;

                return (
                  <tr key={transfer.id} className="border-b">
                    <td className="min-w-0 px-4 py-3">
                      <Link
                        href={`/players/${transfer.player.slug}`}
                        className="block truncate text-blue-600 hover:underline"
                        title={transfer.player.name}
                      >
                        {transfer.player.name}
                      </Link>
                    </td>
                    <td
                      className="truncate px-4 py-3"
                      title={otherClub?.name ?? "Free Agent"}
                    >
                      {otherClub?.name ?? "Free Agent"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 tabular-nums">
                      <TransferFee fee={transfer.fee} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 tabular-nums">
                      <MarketValue marketValue={transfer.marketValue} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="min-w-[150px]">
                        <TransferValueRating
                          fee={transfer.fee}
                          marketValue={transfer.marketValue}
                          perspective={incoming ? "buyer" : "seller"}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
