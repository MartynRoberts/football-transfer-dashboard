import Image from "next/image";
import Link from "next/link";
import { ClubIdentityProps } from "@/lib/sync/types";

export default function ClubIdentity({
  club,
  showLeague = true,
  link = true,
  linkLeague = false,
  h1 = false,
  playerProfile = false,
}: ClubIdentityProps) {
  let width = 40;
  if (!link) {
    width = 64;
  }

  const clubBadge = club.logoUrl ? (
    <Image
      src={club.logoUrl}
      alt={`${club.name} badge`}
      width={width}
      height={width}
      className="object-contain"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
      ⚽
    </div>
  );

  const content = (
    <div
      className={`flex items-center gap-3 ${playerProfile && "justify-between"}`}
    >
      {!playerProfile && clubBadge}

      <div>
        {h1 ? (
          <h1 className="text-3xl font-bold">{club.name}</h1>
        ) : showLeague ? (
          <p className="font-semibold text-slate-900">{club.name}</p>
        ) : playerProfile ? (
          <h1 className="text-xl font-semibold">{club.name}</h1>
        ) : (
          <h1 className="font-semibold text-slate-900">{club.name}</h1>
        )}

        {showLeague && club.league && (
          <p className="text-xs text-slate-500">
            {linkLeague ? (
              <Link
                href={`/leagues/${club.league.slug}`}
                className="hover:text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {club.league.name}
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
    <Link
      href={`/clubs/${club.slug}`}
      className="hover:text-blue-600 transition"
    >
      {content}
    </Link>
  );
}
