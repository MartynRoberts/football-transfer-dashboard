"use client";

import Image from "next/image";
import { useState } from "react";
import ClubLogo from "@/components/clubs/ClubLogo";
import { LEAGUE_META } from "@/lib/data/leagues";

export interface SearchResultCardData {
  name: string;
  type: "player" | "club" | "league";
  detail?: string | null;
  imageUrl?: string | null;
  logoUrl?: string | null;
  transfermarktId?: string | null;
}

export default function SearchResultCard({
  result,
  compact = false,
}: {
  result: SearchResultCardData;
  compact?: boolean;
}) {
  const imageSize = compact ? 40 : 56;

  return (
    <span className="flex min-w-0 items-center gap-3">
      <ResultImage result={result} size={imageSize} />
      <span className="min-w-0">
        <span className="block truncate font-medium">{result.name}</span>
        <span className="block truncate text-xs capitalize text-slate-500">
          {result.type}
          {result.detail ? ` · ${result.detail}` : ""}
        </span>
      </span>
    </span>
  );
}

function ResultImage({
  result,
  size,
}: {
  result: SearchResultCardData;
  size: number;
}) {
  const [playerImageFailed, setPlayerImageFailed] = useState(false);

  if (result.type === "club") {
    return (
      <ClubLogo
        url={result.logoUrl}
        name={result.name}
        size={size}
      />
    );
  }

  if (result.type === "league") {
    const meta = result.transfermarktId
      ? LEAGUE_META[result.transfermarktId as keyof typeof LEAGUE_META]
      : null;
    return meta?.logo ? (
      <Image
        src={meta.logo}
        alt={`${result.name} logo`}
        width={size}
        height={size}
        className="shrink-0 object-contain"
      />
    ) : null;
  }

  const showPlayerImage = Boolean(result.imageUrl) && !playerImageFailed;
  return (
    <Image
      src={showPlayerImage ? result.imageUrl! : "/images/player-placeholder.png"}
      alt={showPlayerImage ? `${result.name} profile` : ""}
      width={size}
      height={size}
      sizes={`${size}px`}
      aria-hidden={showPlayerImage ? undefined : "true"}
      className="shrink-0 rounded-md object-cover object-top"
      onError={() => setPlayerImageFailed(true)}
    />
  );
}
