import type { ReactNode } from "react";

import { ordinal } from "@/lib/players/formatters";

export function formatRank(
  rank: number | null,
  total: number | null,
): ReactNode {
  if (rank === null) {
    return "-";
  }

  if (total === null) {
    return ordinal(rank);
  }

  return (
    <>
      {ordinal(rank)}
      <span className="text-sm"> of {total}</span>
    </>
  );
}
