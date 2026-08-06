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
}

export default function PlayerHeader({
  player,
  secondaryPositions,
}: PlayerHeaderProps) {
  const nationalityCode = getNationalityCode(player.nationality);

  return (
    <div className="flex flex-col justify-between gap-10">
      <section className="flex items-center gap-6 w-full justify-between">
        <div className="flex min-h-28 items-stretch gap-6">
          <PlayerCardImage
            src={player.imageUrl}
            playerName={player.name}
            preload
            fillCard
          />

          <div>
            <div className="flex items-center gap-2 text-lg">
              {nationalityCode && (
                <span
                  className={`fi fi-${nationalityCode}`}
                  role="img"
                  aria-label={`${player.nationality} flag`}
                />
              )}

              <span>{player.nationality ?? "-"}</span>
            </div>

            <h1 className="page-title mt-2">
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
      </section>

      <section className="flex gap-4">
        <PlayerPositionsPitch
          primaryPosition={player.position}
          secondaryPositions={secondaryPositions}
        />

        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="analytics-panel">
            <div className="text-sm text-gray-500">Joined Club</div>
            <div className="text-xl font-semibold">
              {player.joinedOn ? player.joinedOn.toLocaleDateString() : "-"}
            </div>
          </div>
          <div className="analytics-panel">
            <div className="text-sm text-gray-500">Contract Until</div>
            <div className="text-xl font-semibold">
              {player.contract ? player.contract.toLocaleDateString() : "-"}
            </div>
          </div>
          <PlayerProfileCards player={player} />
        </div>

        <HeightPercentiles player={player} />
      </section>
    </div>
  );
}
