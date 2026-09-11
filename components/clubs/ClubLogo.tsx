"use client";

import Image from "next/image";
import { useState } from "react";
import { getClubLogoUrl } from "@/lib/images/club-logo-url";

export default function ClubLogo({
  url,
  name,
  size,
  preload = false,
}: {
  url?: string | null;
  name: string;
  size: number;
  preload?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!url || failed) return null;

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Image
        src={getClubLogoUrl(url)}
        alt={`${name} badge`}
        width={size}
        height={size}
        sizes={`${size}px`}
        preload={preload}
        fetchPriority={preload ? "high" : "auto"}
        unoptimized
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`size-full object-contain transition-opacity duration-150 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}
