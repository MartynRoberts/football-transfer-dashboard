import Link from "next/link";

import { PLAYER_ALPHABET } from "@/lib/players/player-list";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Football Players",
  description:
    "Browse football players by surname and explore transfer histories, market values, injuries and performance statistics.",
  path: "/players",
});

export default function PlayersPage() {
  return (
    <main className="app-page">
      <h1 className="page-title mb-2">Players</h1>

      <p className="mb-6 text-slate-600">Browse players by surname.</p>

      <nav
        aria-label="Player surname index"
        className="grid grid-cols-6 gap-2 sm:grid-cols-9 md:grid-cols-13"
      >
        {PLAYER_ALPHABET.map((letter) => (
          <Link
            key={letter}
            href={`/players/letter/${letter.toLowerCase()}`}
            className="card-link flex aspect-square items-center justify-center text-lg font-semibold"
          >
            {letter}
          </Link>
        ))}
      </nav>
    </main>
  );
}
