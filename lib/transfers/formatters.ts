export function formatTransferFee(
  fee: number | null,
  transferType: string | null,
): string {
  if (fee === null) {
    return transferType
      ? `${transferType.charAt(0).toUpperCase()}${transferType.slice(1)}`
      : "Undisclosed";
  }

  if (fee === 0) return "Free";
  return `€${fee.toLocaleString()}`;
}

export function formatMarketValue(marketValue: number | null): string {
  return marketValue === null ? "-" : `€${marketValue.toLocaleString()}`;
}

export function getEffectiveTransferFee(
  fee: number | null,
  transferType?: string | null,
): number | null {
  if (fee !== null) return fee;

  return transferType?.trim().toLowerCase() === "free transfer" ? 0 : null;
}
