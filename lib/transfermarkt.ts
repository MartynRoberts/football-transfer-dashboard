const BASE_URL = "https://transfermarkt-api.fly.dev";

export async function getTransfers() {
  const response = await fetch(`${BASE_URL}/transfers`);

  if (!response.ok) {
    throw new Error("Failed to fetch transfers");
  }

  return response.json();
}
