interface SquadPlayer {
  id: string;
}

interface ScheduledTransfer<Player extends SquadPlayer> {
  fromClubId: string | null;
  toClubId: string | null;
  player: Player;
}

export function getCurrentSquadPlayers<Player extends SquadPlayer>(
  clubId: string,
  storedPlayers: Player[],
  scheduledTransfers: ScheduledTransfer<Player>[],
): Player[] {
  const playersById = new Map(
    storedPlayers.map((player) => [player.id, player]),
  );
  const handledPlayerIds = new Set<string>();

  for (const transfer of scheduledTransfers) {
    if (handledPlayerIds.has(transfer.player.id)) continue;
    handledPlayerIds.add(transfer.player.id);

    if (transfer.fromClubId === clubId) {
      playersById.set(transfer.player.id, transfer.player);
    } else if (transfer.toClubId === clubId) {
      playersById.delete(transfer.player.id);
    }
  }

  return Array.from(playersById.values());
}
