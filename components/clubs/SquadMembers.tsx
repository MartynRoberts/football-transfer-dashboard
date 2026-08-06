import Link from "next/link";
import PlayerCardImage from "@/components/players/PlayerCardImage";

interface SquadPlayer {
  id: string;
  slug: string;
  name: string;
  shirtNumber: number | null;
  position: string | null;
  imageUrl: string | null;
}

export default function SquadMembers({ players }: { players: SquadPlayer[] }) {
  return (
    <section>
      <h2 className="section-title">Squad members</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {players.map((player) => (
          <Link
            key={player.id}
            href={`/players/${player.slug}`}
            className="card-link flex min-h-28 items-stretch overflow-hidden"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                <span>#{player.shirtNumber ?? "—"}</span> {player.name}
              </p>
              <p className="text-sm text-gray-500">
                {player.position ?? "Unknown"}
              </p>
            </div>
            <PlayerCardImage src={player.imageUrl} playerName={player.name} />
          </Link>
        ))}
      </div>
    </section>
  );
}
