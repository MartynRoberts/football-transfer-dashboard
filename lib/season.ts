export function getSelectedSeason(season?: string) {
  return season ?? "2025-26";
}

export function toApiSeason(season: string) {
  const [start, end] = season.split("-");

  return `${start.slice(-2)}/${end}`;
}
