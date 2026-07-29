"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SEASONS = ["2025-26", "2024-25", "2023-24"];

export default function SeasonSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSeason = searchParams.get("season") ?? "2025-26";

  function onChange(season: string) {
    const params = new URLSearchParams(searchParams);

    params.set("season", season);

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={currentSeason}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded-md px-3 py-2 text-sm"
    >
      {SEASONS.map((season) => (
        <option key={season} value={season}>
          {season.replace("-", "/")}
        </option>
      ))}
    </select>
  );
}
