import type { PlayerStat } from "@prisma/client";
import { buildSeasonPerformances } from "@/lib/players/player-statistics";

describe("buildSeasonPerformances discipline", () => {
  it("aggregates cards across competitions and calculates player rates", () => {
    const stats = [
      {
        season: "25/26",
        clubId: "1",
        competitionId: "league",
        appearances: 10,
        minutesPlayed: 900,
        goals: 0,
        assists: 0,
        yellowCards: 2,
        redCards: 1,
      },
      {
        season: "25/26",
        clubId: "1",
        competitionId: "cup",
        appearances: 5,
        minutesPlayed: 450,
        goals: 0,
        assists: 0,
        yellowCards: 1,
        redCards: 0,
      },
    ] as PlayerStat[];

    const [performance] = buildSeasonPerformances(stats, [], {
      playerId: "player",
      playerPosition: null,
      playerLeagueId: null,
      comparisonPerformances: [],
    });

    expect(performance).toMatchObject({
      appearances: 15,
      yellowCards: 3,
      redCards: 1,
      cardsPerAppearance: 0.27,
      cardsPer90: "0.27",
    });
  });
});
