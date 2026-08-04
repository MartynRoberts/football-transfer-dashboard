export const PLAYER_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function formatSurnameFirst(name: string): string {
  const parts = name.trim().split(/\s+/);

  if (parts.length <= 1) {
    return name;
  }

  const surname = parts.pop();

  return `${surname}, ${parts.join(" ")}`;
}

export function getSurnameInitial(name: string): string {
  const displayName = formatSurnameFirst(name);
  const initial = displayName.charAt(0).toUpperCase();

  return PLAYER_ALPHABET.includes(initial) ? initial : "#";
}
