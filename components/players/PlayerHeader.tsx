import Image from "next/image";
import Link from "next/link";

import type { PlayerWithPageRelations } from "@/lib/players/types";

interface PlayerHeaderProps {
  player: PlayerWithPageRelations;
  secondaryPositions: string[];
}

export default function PlayerHeader({
  player,
  secondaryPositions,
}: PlayerHeaderProps) {
  return (
    <div className="flex justify-between">
      <section className="flex items-center gap-6">
        {player.imageUrl && (
          <Image
            src={player.imageUrl}
            alt={player.name}
            width={180}
            height={240}
            className="rounded-lg object-cover"
          />
        )}

        <div>
          <h1 className="text-4xl font-bold">
            {player.shirtNumber != null ? `#${player.shirtNumber} ` : ""}{" "}
            {player.name}
          </h1>
          <div className="mt-2 text-gray-500">
            <p>{player.position ?? "Unknown position"}</p>
            {secondaryPositions.map((position) => (
              <p key={position} className="text-sm text-slate-500">
                {position}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Current Club</div>
          {player.currentClub ? (
            <Link
              href={`/clubs/${player.currentClub.slug}`}
              className="text-xl font-semibold text-blue-600 hover:underline"
            >
              {player.currentClub.name}
            </Link>
          ) : (
            "-"
          )}
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Contract Until</div>
          <div className="text-xl font-semibold">
            {player.contract ? player.contract.toLocaleDateString() : "-"}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Joined Club</div>
          <div className="text-xl font-semibold">
            {player.joinedOn ? player.joinedOn.toLocaleDateString() : "-"}
          </div>
        </div>
      </section>
    </div>
  );
}
