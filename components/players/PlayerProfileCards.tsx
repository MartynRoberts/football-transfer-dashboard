import type { PlayerWithPageRelations } from "@/lib/players/types";

export default function PlayerProfileCards({
  player,
}: {
  player: PlayerWithPageRelations;
}) {
  const cards = [
    { label: "Nationality", value: player.nationality ?? "-" },
    { label: "Preferred Foot", value: player.foot ?? "-" },
    { label: "Height", value: player.height ? `${player.height} cm` : "-" },
    {
      label: "Market Value",
      value:
        player.marketValue !== null
          ? `€${player.marketValue.toLocaleString()}`
          : "-",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">{card.label}</div>
          <div className="text-xl font-semibold">{card.value}</div>
        </div>
      ))}
    </section>
  );
}
