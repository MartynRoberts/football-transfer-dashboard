export function getLastThreeSeasons(currentSeason: string): string[] {
  const match = currentSeason.match(/^(\d{2})\/(\d{2})$/);

  if (!match) return [currentSeason];

  const startYear = Number(match[1]);

  return Array.from({ length: 3 }, (_, index) => {
    const seasonStart = (startYear - index + 100) % 100;
    const seasonEnd = (seasonStart + 1) % 100;
    return `${seasonStart.toString().padStart(2, "0")}/${seasonEnd
      .toString()
      .padStart(2, "0")}`;
  });
}

export function formatNetSpend(value: number): {
  value: string;
  detail: string;
} {
  const formattedValue = formatPounds(Math.abs(value));

  if (value > 0)
    return { value: formattedValue, detail: "(Based on known fees)" };
  if (value < 0)
    return { value: formattedValue, detail: "Net transfer profit" };
  return { value: "£0", detail: "Balanced transfer activity" };
}
import { formatPounds } from "@/lib/currency";
