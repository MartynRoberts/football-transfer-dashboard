import type { PlayerWithPageRelations } from "@/lib/players/types";
import TransferValueRating from "@/components/transfers/TransferValueRating";

export default function TransferHistory({
  transfers,
}: {
  transfers: PlayerWithPageRelations["transfers"];
}) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Transfer History</h2>
      {transfers.length === 0 ? (
        <p className="text-gray-500">No transfer history available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">From</th>
                <th className="p-3 text-left">To</th>
                <th className="p-3 text-left">Fee</th>
                <th className="p-3 text-left">Market Value</th>
                <th className="p-3 text-left">Value rating</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => (
                <tr key={transfer.id} className="border-b">
                  <td className="p-3">
                    {transfer.transferDate?.toLocaleDateString() ?? "-"}
                  </td>
                  <td className="p-3">{transfer.fromClub?.name ?? "-"}</td>
                  <td className="p-3">{transfer.toClub?.name ?? "-"}</td>
                  <td className="p-3">
                    {transfer.fee === null
                      ? "Undisclosed"
                      : transfer.fee === 0
                        ? "Free"
                        : `€${transfer.fee.toLocaleString()}`}
                  </td>
                  <td className="p-3">
                    {transfer.marketValue !== null
                      ? `€${transfer.marketValue.toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="p-3">
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
