interface RankedPlayer {
  playerId: string;
  value: number;
}

export interface CalculatedRank {
  rank: number | null;
  total: number;
}

export function calculateCompetitionRank(
  playerId: string,
  players: RankedPlayer[],
): CalculatedRank {
  const player = players.find((candidate) => candidate.playerId === playerId);

  if (!player) {
    return {
      rank: null,
      total: players.length,
    };
  }

  return {
    rank:
      1 + players.filter((candidate) => candidate.value > player.value).length,
    total: players.length,
  };
}
