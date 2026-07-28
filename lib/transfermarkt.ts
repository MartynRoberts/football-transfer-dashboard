const BASE_URL = process.env.TRANSFERMARKT_API_URL;

async function apiRequest<T>(path: string): Promise<T> {
  if (!BASE_URL) {
    throw new Error("TRANSFERMARKT_API_URL is not configured");
  }

  const response = await fetch(`${BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Transfermarkt API error ${response.status}`);
  }

  return response.json();
}

export function searchCompetition(name: string) {
  return apiRequest(`/competitions/search/${encodeURIComponent(name)}`);
}

export function getCompetitionClubs(competitionId: string, seasonId?: string) {
  const query = seasonId ? `?season_id=${seasonId}` : "";

  return apiRequest(`/competitions/${competitionId}/clubs${query}`);
}

export function getClubPlayers(clubId: string, seasonId?: string) {
  const query = seasonId ? `?season_id=${seasonId}` : "";

  return apiRequest(`/clubs/${clubId}/players${query}`);
}

export function getPlayerTransfers(playerId: string) {
  return apiRequest(`/players/${playerId}/transfers`);
}
