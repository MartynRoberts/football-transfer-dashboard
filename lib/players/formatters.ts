export function ordinal(value: number): string {
  const remainder100 = value % 100;

  if (remainder100 >= 11 && remainder100 <= 13) {
    return `${value}th`;
  }

  return `${value}${value % 10 === 1 ? "st" : value % 10 === 2 ? "nd" : value % 10 === 3 ? "rd" : "th"}`;
}

export function pluralizePosition(position: string): string {
  const labels: Record<string, string> = {
    "attacking midfield": "attacking midfielders",
    "central midfield": "central midfielders",
    "defensive midfield": "defensive midfielders",
    goalkeeper: "goalkeepers",
  };
  const normalized = position.toLowerCase();

  return labels[normalized] ?? `${normalized}s`;
}

export function per90(total: number, minutesPlayed: number): string {
  if (minutesPlayed <= 0) {
    return "0.00";
  }

  return ((total * 90) / minutesPlayed).toFixed(2);
}
