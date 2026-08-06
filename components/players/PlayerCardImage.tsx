"use client";

import Image from "next/image";
import { useState } from "react";

interface PlayerCardImageProps {
  src: string | null;
  playerName: string;
  preload?: boolean;
}

export default function PlayerCardImage({
  src,
  playerName,
  preload = false,
}: PlayerCardImageProps) {
  const [failed, setFailed] = useState(false);

  const showPlayerImage = Boolean(src) && !failed;

  return (
    <div className="relative ml-auto h-28 w-24 shrink-0 overflow-hidden">
      <Image
        src="/images/player-placeholder.png"
        alt=""
        fill
        sizes="96px"
        aria-hidden="true"
        className="object-contain object-right-bottom"
      />

      {showPlayerImage && (
        <Image
          src={src!}
          alt={`${playerName} profile`}
          fill
          sizes="96px"
          preload={preload}
          fetchPriority={preload ? "high" : "auto"}
          className="object-contain object-right-bottom"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
