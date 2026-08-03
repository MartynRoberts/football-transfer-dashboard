import type { PlayerWithPageRelations } from "@/lib/players/types";

export default function InjuryHistory({
  injuries,
}: {
  injuries: PlayerWithPageRelations["injuries"];
}) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Injury History</h2>
      {injuries.length === 0 ? (
        <p className="text-gray-500">No injury records.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <tbody>
              {injuries.map((injury) => (
                <tr key={injury.id} className="border-b">
                  <td className="p-3">{injury.description ?? "-"}</td>
                  <td className="p-3">
                    {injury.startDate?.toLocaleDateString() ?? "-"}
                  </td>
                  <td className="p-3">
                    {injury.expectedReturn?.toLocaleDateString() ?? "-"}
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
