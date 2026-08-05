import { prisma } from "../prisma";

export const TOP_FIVE_LEAGUE_IDS = ["GB1", "L1", "ES1", "IT1", "FR1"] as const;

export const TRANSFER_SEASON = "26/27";

const NEW_SEASON_KICKOFF = Date.parse("2026-08-21T00:00:00+01:00");

export function getCurrentSeason(now = new Date()): string {
  return now.getTime() >= NEW_SEASON_KICKOFF ? "26/27" : "25/26";
}

export const CURRENT_SEASON = getCurrentSeason();

let firstTeamClubIdsPromise: Promise<Set<string>> | undefined;

export function getTopFiveFirstTeamClubIds(): Promise<Set<string>> {
  firstTeamClubIdsPromise ??= prisma.club
    .findMany({
      where: {
        transfermarktId: {
          not: null,
        },
        league: {
          is: {
            transfermarktId: {
              in: [...TOP_FIVE_LEAGUE_IDS],
            },
          },
        },
      },
      select: {
        transfermarktId: true,
      },
    })
    .then(
      (clubs) =>
        new Set(
          clubs.flatMap((club) =>
            club.transfermarktId ? [club.transfermarktId] : [],
          ),
        ),
    );

  return firstTeamClubIdsPromise;
}
