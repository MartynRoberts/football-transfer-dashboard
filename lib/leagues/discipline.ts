import type { ClubDisciplineRow } from "@/lib/leagues/types";

export interface DisciplineClub {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  transfermarktId: string | null;
  leagueName: string;
}

export interface DisciplineStat {
  clubId: string | null;
  appearances: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
}

export function calculateClubDisciplineRows(
  clubs: DisciplineClub[],
  stats: DisciplineStat[],
): ClubDisciplineRow[] {
  const clubByStatId = new Map(
    clubs.flatMap((club) =>
      club.transfermarktId ? [[club.transfermarktId, club] as const] : [],
    ),
  );
  const totals = new Map(
    clubs.map((club) => [
      club.id,
      {
        club,
        yellowCards: 0,
        redCards: 0,
        minutesPlayed: 0,
        maxAppearances: 0,
      },
    ]),
  );

  for (const stat of stats) {
    if (!stat.clubId) continue;
    const club = clubByStatId.get(stat.clubId);
    if (!club) continue;
    const total = totals.get(club.id)!;
    total.yellowCards += stat.yellowCards;
    total.redCards += stat.redCards;
    total.minutesPlayed += stat.minutesPlayed;
    total.maxAppearances = Math.max(total.maxAppearances, stat.appearances);
  }

  return [...totals.values()]
    .map(({ club, ...total }) => {
      const matchesCovered = Math.max(
        total.minutesPlayed / (11 * 90),
        total.maxAppearances,
      );
      if (matchesCovered <= 0) return null;

      return {
        id: club.id,
        name: club.name,
        slug: club.slug,
        logoUrl: club.logoUrl,
        leagueName: club.leagueName,
        yellowCards: total.yellowCards,
        redCards: total.redCards,
        matchesCovered,
        cardsPerMatch: (total.yellowCards + total.redCards) / matchesCovered,
      };
    })
    .filter((row): row is ClubDisciplineRow => row !== null)
    .sort(
      (first, second) =>
        first.cardsPerMatch - second.cardsPerMatch ||
        first.name.localeCompare(second.name),
    );
}
