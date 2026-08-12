// ECB euro reference exchange rate, 29 July 2026: EUR 1 = GBP 0.85635.
// Stored Transfermarkt values remain in euros; conversion is display-only.
export const EUR_TO_GBP_RATE = 0.85635;

export function eurosToPounds(value: number): number {
  return value * EUR_TO_GBP_RATE;
}

export function formatPounds(valueInEuros: number): string {
  const pounds = eurosToPounds(valueInEuros);
  const absoluteValue = Math.abs(pounds);
  const sign = pounds < 0 ? "-" : "";

  if (absoluteValue >= 1_000_000_000) {
    return `${sign}£${(absoluteValue / 1_000_000_000).toFixed(2)}bn`;
  }
  if (absoluteValue >= 1_000_000) {
    return `${sign}£${(absoluteValue / 1_000_000).toFixed(1)}m`;
  }
  if (absoluteValue >= 1_000) {
    return `${sign}£${Math.round(absoluteValue / 1_000).toLocaleString("en-GB")}k`;
  }

  return `${sign}£${Math.round(absoluteValue).toLocaleString("en-GB")}`;
}
