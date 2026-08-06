import type { PlayerWithPageRelations } from "@/lib/players/types";
import { capitalise } from "@/utils/capitalise";

export default function PlayerProfileCards({
  player,
}: {
  player: PlayerWithPageRelations;
}) {
  const cards = [
    {
      label: "Market Value",
      value:
        player.marketValue !== null
          ? `€${player.marketValue.toLocaleString()}`
          : "-",
    },
    {
      label: "Preferred Foot",
      value: player.foot ? capitalise(player.foot) : "-",
    },
  ];

  return (
    <>
      {cards.map((card) => (
        <div key={card.label} className="analytics-panel">
          <div className="text-sm text-gray-500">{card.label}</div>
          <div className="mt-1 text-xl font-semibold">{card.value}</div>
        </div>
      ))}
    </>
  );
}
