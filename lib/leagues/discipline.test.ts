import { calculateClubDisciplineRows } from "@/lib/leagues/discipline";

const clubs = [
  {
    id: "a",
    name: "Alpha",
    slug: "alpha",
    logoUrl: null,
    transfermarktId: "10",
    leagueName: "League",
  },
  {
    id: "b",
    name: "Beta",
    slug: "beta",
    logoUrl: null,
    transfermarktId: "20",
    leagueName: "League",
  },
];

describe("calculateClubDisciplineRows", () => {
  it("aggregates cards, estimates match coverage and ranks lowest rate first", () => {
    const rows = calculateClubDisciplineRows(clubs, [
      {
        clubId: "10",
        appearances: 8,
        minutesPlayed: 9900,
        yellowCards: 12,
        redCards: 1,
      },
      {
        clubId: "20",
        appearances: 10,
        minutesPlayed: 9900,
        yellowCards: 20,
        redCards: 2,
      },
    ]);

    expect(rows.map((row) => row.name)).toEqual(["Alpha", "Beta"]);
    expect(rows[0]).toMatchObject({
      yellowCards: 12,
      redCards: 1,
      matchesCovered: 10,
    });
    expect(rows[0].cardsPerMatch).toBeCloseTo(1.3);
  });

  it("uses appearances when recorded minutes are incomplete and omits clubs without coverage", () => {
    const rows = calculateClubDisciplineRows(clubs, [
      {
        clubId: "10",
        appearances: 12,
        minutesPlayed: 900,
        yellowCards: 6,
        redCards: 0,
      },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].matchesCovered).toBe(12);
    expect(rows[0].cardsPerMatch).toBe(0.5);
  });
});
