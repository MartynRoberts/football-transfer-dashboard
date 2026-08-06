import Image from "next/image";
import Link from "next/link";
import { ClubIdentityProps } from "@/lib/sync/types";
import { normalizeRemoteImageUrl } from "@/lib/images/normalize-remote-image-url";

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

  const clubBadge = club.logoUrl ? (
    <Image
      src={normalizeRemoteImageUrl(club.logoUrl)}
      alt={`${club.name} badge`}
      width={width}
      height={width}
      preload={imagePreload}
      fetchPriority={imagePreload ? "high" : "auto"}
      className="object-contain"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
      ⚽
    </div>
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
                className="hover:text-brand hover:underline"
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
    <Link href={`/clubs/${club.slug}`} className="transition hover:text-brand">
      {content}
    </Link>
  );
}
