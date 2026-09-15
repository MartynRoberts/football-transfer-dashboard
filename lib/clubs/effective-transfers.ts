export function effectiveTransferDateFilter(now = new Date()) {
  return {
    OR: [{ transferDate: null }, { transferDate: { lte: now } }],
  };
}
