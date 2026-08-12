import type { ReactNode } from "react";
import PlayerCardImage from "@/components/players/PlayerCardImage";
import type { PlayerWithPageRelations } from "@/lib/players/types";
import { getNationalityCode } from "@/lib/players/nationality-code";
import PlayerPositionsPitch from "@/components/players/PlayerPositionsPitch";
import ClubIdentity from "@/components/clubs/ClubIdentity";
import PlayerProfileCards from "@/components/players/PlayerProfileCards";
import HeightPercentiles from "./HeightPercentiles";

interface PlayerHeaderProps {
  player: PlayerWithPageRelations;
  secondaryPositions: string[];
  navigation?: ReactNode;
}

export default function PlayerHeader({
  player,
  secondaryPositions,
  navigation,
}: PlayerHeaderProps) {
  const nationalityCode = getNationalityCode(player.nationality);
  const age = player.dateOfBirth ? calculateAge(player.dateOfBirth) : null;

  return (
    <div className="contents">
      <section
        id="overview"
        className="section-anchor flex w-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
      >
        <div className="flex min-w-0 min-h-28 items-stretch gap-4 [&>img]:ml-0 sm:gap-6">
          <PlayerCardImage
            src={player.imageUrl}
            playerName={player.name}
            preload
            fillCard
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-base sm:text-lg">
              {nationalityCode && (
                <span
                  className={`fi fi-${nationalityCode}`}
                  role="img"
                  aria-label={`${player.nationality} flag`}
                />
              )}

              <span>{player.nationality ?? "-"}</span>
            </div>

            <h1 className="mt-2 text-2xl leading-tight font-bold break-words sm:text-3xl sm:leading-9">
              {player.shirtNumber != null ? `#${player.shirtNumber} ` : ""}{" "}
              {player.name}
            </h1>

            <div className="mt-2">
              <p className="text-lg">{player.position ?? "Unknown position"}</p>
              {/*
            {secondaryPositions.map((position) => (
              <p key={position} className="text-sm text-slate-500">
                {position}
              </p>
            ))}
            */}
            </div>
          </div>
        </div>

        <div className="min-w-0 border-t pt-4 sm:border-t-0 sm:pt-0 [&_h1]:text-xl [&_h1]:leading-tight [&_h1]:break-words sm:[&_h1]:text-3xl">
          {player.currentClub ? (
            <ClubIdentity
              club={player.currentClub}
              link={true}
              showLeague={false}
              playerProfile={false}
              h1={true}
            />
          ) : (
            "-"
          )}
        </div>
      </section>

      {navigation}

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,1fr)_minmax(20rem,1fr)]">
        <PlayerPositionsPitch
          primaryPosition={player.position}
          secondaryPositions={secondaryPositions}
        />

        <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
          {player.dateOfBirth && age !== null && (
            <div className="analytics-panel">
              <div className="text-sm text-gray-500">Age</div>
              <div className="text-xl font-semibold">{age}</div>
              <div className="mt-1 text-sm text-gray-500">
                Born {player.dateOfBirth.toLocaleDateString("en-GB")}
              </div>
            </div>
          )}
          <PlayerProfileCards player={player} />

          <div className="analytics-panel">
            <div className="text-sm text-gray-500">Joined Club</div>
            <div className="text-xl font-semibold">
              {player.joinedOn
                ? player.joinedOn.toLocaleDateString("en-GB")
                : "-"}
            </div>
          </div>
          <div className="analytics-panel">
            <div className="text-sm text-gray-500">Contract Until</div>
            <div className="text-xl font-semibold">
              {player.contract
                ? player.contract.toLocaleDateString("en-GB")
                : "-"}
            </div>
          </div>
        </div>

        <HeightPercentiles player={player} />
      </section>
    </div>
  );
}

function calculateAge(dateOfBirth: Date, today = new Date()): number {
  let age = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const birthdayHasPassed =
    today.getUTCMonth() > dateOfBirth.getUTCMonth() ||
    (today.getUTCMonth() === dateOfBirth.getUTCMonth() &&
      today.getUTCDate() >= dateOfBirth.getUTCDate());

  if (!birthdayHasPassed) {
    age -= 1;
  }

  return age;
}
