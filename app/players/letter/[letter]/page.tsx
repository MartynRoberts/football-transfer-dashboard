import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClubName from "@/components/clubs/ClubName";
import PlayerCardImage from "@/components/players/PlayerCardImage";

import { prisma } from "@/lib/prisma";
import { PLAYER_ALPHABET } from "@/lib/players/player-list";
import { TOP_FIVE_LEAGUE_IDS } from "@/lib/sync/scope";
import { createPageMetadata } from "@/lib/seo/metadata";

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

export async function generateMetadata({
  params,
}: PlayersByLetterPageProps): Promise<Metadata> {
  const { letter: rawLetter } = await params;
  const letter = rawLetter.toUpperCase();

  if (!PLAYER_ALPHABET.includes(letter)) {
    return { title: "Players not found", robots: { index: false } };
  }

  return createPageMetadata({
    title: `Football Players Beginning with ${letter}`,
    description: `Browse football players whose surnames begin with ${letter}, including their clubs, transfers and performance data.`,
    path: `/players/letter/${letter.toLowerCase()}`,
  });
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
      imageUrl: true,

      currentClub: {
        select: {
          name: true,
          logoUrl: true,
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
              className="card-link relative flex min-h-28 items-stretch overflow-hidden !py-0 !pr-0"
            >
              <div className="min-w-0 flex-1 py-4 pr-28">
                <h2 className="font-bold break-words">
                  {player.sortName ?? player.name}
                </h2>

                {player.currentClub ? (
                  <ClubName
                    club={player.currentClub}
                    size={18}
                    className="mt-1 text-sm text-slate-500"
                  />
                ) : (
                  <p className="text-sm text-slate-500">No current club</p>
                )}
              </div>
              <PlayerCardImage
                src={player.imageUrl}
                playerName={player.name}
                fillCard
                overlayCard
              />
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
