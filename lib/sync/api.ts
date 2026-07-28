const API_BASE_URL =
  process.env.TRANSFERMARKT_API_URL || "http://localhost:8000"; // Adjust port if needed

export async function fetchFromApi<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!res.ok) {
      console.error(`[API Error] ${endpoint} returned status ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(
      `[Fetch Failed] Unable to connect to local API at ${endpoint}:`,
      error,
    );
    return null;
  }
}
