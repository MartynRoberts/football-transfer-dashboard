export function formatMoney(value: number): string {
  const absoluteValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absoluteValue >= 1_000_000_000) {
    return `${sign}€${(absoluteValue / 1_000_000_000).toFixed(2)}bn`;
  }
  if (absoluteValue >= 1_000_000) {
    return `${sign}€${(absoluteValue / 1_000_000).toFixed(1)}m`;
  }
  if (absoluteValue >= 1_000) {
    return `${sign}€${(absoluteValue / 1_000).toFixed(1)}k`;
  }
  return `${sign}€${absoluteValue.toLocaleString()}`;
}
