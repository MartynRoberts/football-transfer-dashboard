import { prisma } from "../prisma";

export const TOP_FIVE_LEAGUE_IDS = ["GB1", "L1", "ES1", "IT1", "FR1"] as const;
export const CURRENT_SEASON = "26/27";

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
