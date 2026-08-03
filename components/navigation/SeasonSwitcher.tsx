"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SEASONS = ["2026-27", "2025-26", "2024-25", "2023-24"];

function SeasonSwitcherContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSeason = searchParams.get("season") ?? "2026-27";

  function onChange(season: string) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("season", season);

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={currentSeason}
      onChange={(event) => onChange(event.target.value)}
      className="border rounded-md px-3 py-2 text-sm"
      aria-label="Select season"
    >
      {SEASONS.map((season) => (
        <option key={season} value={season}>
          {season.replace("-", "/")}
        </option>
      ))}
    </select>
  );
}

function SeasonSwitcherFallback() {
  return (
    <select
      disabled
      defaultValue="2025-26"
      className="border rounded-md px-3 py-2 text-sm"
      aria-label="Loading season"
    >
      <option value="2025-26">2025/26</option>
    </select>
  );
}

export default function SeasonSwitcher() {
  return (
    <Suspense fallback={<SeasonSwitcherFallback />}>
      <SeasonSwitcherContent />
    </Suspense>
  );
}
