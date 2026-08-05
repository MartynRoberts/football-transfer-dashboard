export function getLastThreeTransferSeasons(transferSeason: string): string[] {
  const match = transferSeason.match(/^(\d{2})\/(\d{2})$/);

  if (!match) {
    return [transferSeason];
  }

  const startYear = Number(match[1]);

  return Array.from({ length: 3 }, (_, index) => {
    const seasonStart = startYear - index;
    const seasonEnd = (seasonStart + 1) % 100;

    return `${seasonStart.toString().padStart(2, "0")}/${seasonEnd
      .toString()
      .padStart(2, "0")}`;
  });
}
