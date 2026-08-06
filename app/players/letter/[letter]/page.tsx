import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { PLAYER_ALPHABET } from "@/lib/players/player-list";
import { TOP_FIVE_LEAGUE_IDS } from "@/lib/sync/scope";

export const revalidate = 60;

interface PlayersByLetterPageProps {
  params: Promise<{
    letter: string;
  }>;
}

export function generateStaticParams() {
  return PLAYER_ALPHABET.map((letter) => ({
    letter: letter.toLowerCase(),
  }));
}

export default async function PlayersByLetterPage({
  params,
}: PlayersByLetterPageProps) {
  const { letter: rawLetter } = await params;
  const letter = rawLetter.toUpperCase();

  if (!PLAYER_ALPHABET.includes(letter)) {
    notFound();
  }

  const players = await prisma.player.findMany({
    where: {
      sortName: {
        startsWith: letter,
      },

      currentClub: {
        is: {
          league: {
            is: {
              transfermarktId: {
                in: [...TOP_FIVE_LEAGUE_IDS],
              },
            },
          },
        },
      },
    },

    orderBy: [
      {
        sortName: "asc",
      },
      {
        name: "asc",
      },
    ],

    select: {
      id: true,
      slug: true,
      name: true,
      sortName: true,

      currentClub: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <main className="app-page">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Players: {letter}</h1>

          <p className="mt-1 text-sm text-slate-500">
            {players.length.toLocaleString()}{" "}
            {players.length === 1 ? "player" : "players"}
          </p>
        </div>

        <Link
          href="/players"
          className="text-brand shrink-0 text-sm font-medium hover:underline"
        >
          All letters
        </Link>
      </div>

      <AlphabetNav activeLetter={letter} />

      {players.length === 0 ? (
        <p className="mt-8 text-slate-500">No players found for {letter}.</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/players/${player.slug}`}
              className="card-link"
            >
              <h2 className="font-bold">{player.sortName ?? player.name}</h2>

              <p className="text-sm text-slate-500">
                {player.currentClub?.name ?? "No current club"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function AlphabetNav({ activeLetter }: { activeLetter: string }) {
  return (
    <nav
      aria-label="Player surname index"
      className="sticky top-16 z-40 -mx-4 overflow-x-auto border-y bg-white/95 px-4 py-3 shadow-sm backdrop-blur"
    >
      <div className="flex min-w-max gap-1">
        {PLAYER_ALPHABET.map((letter) => {
          const isActive = letter === activeLetter;

          return (
            <Link
              key={letter}
              href={`/players/letter/${letter.toLowerCase()}`}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex h-8 w-8 items-center justify-center rounded text-sm font-semibold transition",
                isActive
                  ? "bg-brand text-white"
                  : "text-slate-700 hover:bg-brand-soft hover:text-brand",
              ].join(" ")}
            >
              {letter}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
