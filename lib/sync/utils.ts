export function parseFee(fee: number | null | undefined): number | null {
  if (fee == null || !Number.isFinite(fee)) {
    return null;
  }

  return Math.round(fee);
}
