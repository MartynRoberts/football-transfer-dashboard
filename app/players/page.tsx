import Link from "next/link";

import { PLAYER_ALPHABET } from "@/lib/players/player-list";

export default function PlayersPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Players</h1>

      <p className="mb-6 text-slate-600">Browse players by surname.</p>

      <nav
        aria-label="Player surname index"
        className="grid grid-cols-6 gap-2 sm:grid-cols-9 md:grid-cols-13"
      >
        {PLAYER_ALPHABET.map((letter) => (
          <Link
            key={letter}
            href={`/players/letter/${letter.toLowerCase()}`}
            className="flex aspect-square items-center justify-center rounded-lg border text-lg font-semibold transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
          >
            {letter}
          </Link>
        ))}
      </nav>
    </main>
  );
}
