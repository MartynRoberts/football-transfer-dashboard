export function percentage(part: number, whole: number): number | null {
  if (whole <= 0) {
    return null;
  }

  return Number(((part / whole) * 100).toFixed(1));
}
