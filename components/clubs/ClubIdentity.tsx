import Link from "next/link";
import { ClubIdentityProps } from "@/lib/sync/types";
import ClubLogo from "./ClubLogo";

export default function ClubIdentity({
  club,
  showLeague = true,
  link = true,
  linkLeague = false,
  h1 = false,
  playerProfile = false,
  imagePreload = false,
}: ClubIdentityProps) {
  let width = 40;
  if (!link) {
    width = 64;
  }

  const clubBadge = (
    <ClubLogo
      url={club.logoUrl}
      name={club.name}
      size={width}
      preload={imagePreload}
    />
  );

  const content = (
    <div
      className={`flex items-center gap-4 ${playerProfile && "justify-between"}`}
    >
      {!playerProfile && clubBadge}

      <div>
        {h1 ? (
          <h1 className="page-title">{club.name}</h1>
        ) : showLeague ? (
          <p
            className={`font-semibold text-slate-900 ${link ? "entity-title" : ""}`}
          >
            {club.name}
          </p>
        ) : playerProfile ? (
          <h1 className={`text-xl font-semibold ${link ? "entity-title" : ""}`}>
            {club.name}
          </h1>
        ) : (
          <h1
            className={`font-semibold text-slate-900 ${link ? "entity-title" : ""}`}
          >
            {club.name}
          </h1>
        )}

        {showLeague && club.league && (
          <p className="text-xs text-slate-500">
            {linkLeague ? (
              <Link
                href={`/leagues/${club.league.slug}`}
                className="entity-link"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="entity-title">{club.league.name}</span>
              </Link>
            ) : (
              club.league.name
            )}
          </p>
        )}
      </div>

      {playerProfile && clubBadge}
    </div>
  );

  if (!link || linkLeague) {
    return content;
  }

  return (
    <Link href={`/clubs/${club.slug}`} className="entity-link">
      {content}
    </Link>
  );
}
