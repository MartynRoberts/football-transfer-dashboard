import Image from "next/image";
import { normalizeRemoteImageUrl } from "@/lib/images/normalize-remote-image-url";

export interface ClubNameData {
  name: string;
  logoUrl?: string | null;
}

export default function ClubName({
  club,
  size = 20,
  className = "",
}: {
  club: ClubNameData;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center"
        style={{ width: size, height: size }}
      >
        {club.logoUrl ? (
          <Image
            src={normalizeRemoteImageUrl(club.logoUrl)}
            alt=""
            width={size}
            height={size}
            sizes={`${size}px`}
            className="size-full object-contain"
          />
        ) : (
          <span aria-hidden="true" className="text-[0.75em] text-slate-400">
            ⚽
          </span>
        )}
      </span>
      <span className="truncate">{club.name}</span>
    </span>
  );
}
