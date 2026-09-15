import { getCurrentSquadPlayers } from "./current-squad";

const clubId = "club-a";
const currentPlayer = { id: "current", position: "Goalkeeper" };
const arrivingPlayer = { id: "arrival", position: "Centre-Back" };
const departingPlayer = { id: "departure", position: "Right Winger" };

describe("getCurrentSquadPlayers", () => {
  it("excludes future arrivals and retains future departures", () => {
    expect(
      getCurrentSquadPlayers(
        clubId,
        [currentPlayer, arrivingPlayer],
        [
          {
            fromClubId: clubId,
            toClubId: "club-b",
            player: departingPlayer,
          },
          {
            fromClubId: "club-c",
            toClubId: clubId,
            player: arrivingPlayer,
          },
        ],
      ),
    ).toEqual([currentPlayer, departingPlayer]);
  });

  it("uses the earliest scheduled move for a player", () => {
    expect(
      getCurrentSquadPlayers(
        clubId,
        [],
        [
          { fromClubId: "club-b", toClubId: clubId, player: arrivingPlayer },
          { fromClubId: clubId, toClubId: "club-c", player: arrivingPlayer },
        ],
      ),
    ).toEqual([]);
  });
});
