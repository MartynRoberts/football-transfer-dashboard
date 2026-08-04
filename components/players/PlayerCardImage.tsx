"use client";

import Image from "next/image";
import { useState } from "react";

interface PlayerCardImageProps {
  src: string | null;
  playerName: string;
}

export default function PlayerCardImage({
  src,
  playerName,
}: PlayerCardImageProps) {
  const [loaded, setLoaded] = useState(false);
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
        className={[
          "object-contain object-right-bottom transition-opacity duration-300",
          loaded && showPlayerImage ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />

      {showPlayerImage && (
        <Image
          src={src!}
          alt={`${playerName} profile`}
          fill
          sizes="96px"
          className={[
            "object-contain object-right-bottom transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(false);
          }}
        />
      )}
    </div>
  );
}
