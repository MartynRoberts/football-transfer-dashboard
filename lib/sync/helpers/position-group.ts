export function getPositionGroup(position?: string | null) {
  if (!position) return null;

  const value = position.toLowerCase();

  if (value.includes("goalkeeper") || value.includes("keeper")) {
    return "GOALKEEPER";
  }

  if (
    value.includes("centre-back") ||
    value.includes("center-back") ||
    value.includes("left-back") ||
    value.includes("right-back") ||
    value.includes("full-back") ||
    value.includes("wing-back")
  ) {
    return "DEFENDER";
  }

  if (
    value.includes("defensive midfield") ||
    value.includes("central midfield") ||
    value.includes("midfield") ||
    value.includes("attacking midfield")
  ) {
    return "MIDFIELDER";
  }

  if (
    value.includes("winger") ||
    value.includes("forward") ||
    value.includes("striker") ||
    value.includes("centre-forward") ||
    value.includes("center-forward")
  ) {
    return "FORWARD";
  }

  return "OTHER";
}
