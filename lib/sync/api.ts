const API_BASE_URL =
  process.env.TRANSFERMARKT_API_URL || "http://localhost:8000"; // Adjust port if needed

export async function assertApiIsReachable(): Promise<void> {
  try {
    const response = await fetch(API_BASE_URL, {
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    const reason = error instanceof Error ? ` (${error.message})` : "";

    throw new Error(
      `Transfermarkt API is not reachable at ${API_BASE_URL}${reason}. ` +
        "Start the API or set TRANSFERMARKT_API_URL to a reachable instance " +
        "before running a sync.",
      { cause: error },
    );
  }
}

export class ApiHttpError extends Error {
  constructor(
    public readonly endpoint: string,
    public readonly status: number,
  ) {
    super(`API request to ${endpoint} returned status ${status}`);
    this.name = "ApiHttpError";
  }
}

export async function fetchFromApi<T>(
  endpoint: string,
  options: { throwOnHttpError?: boolean } = {},
): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!res.ok) {
      console.error(`[API Error] ${endpoint} returned status ${res.status}`);

      if (options.throwOnHttpError) {
        throw new ApiHttpError(endpoint, res.status);
      }

      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof ApiHttpError) {
      throw error;
    }

    console.error(
      `[Fetch Failed] Unable to connect to local API at ${endpoint}:`,
      error,
    );
    return null;
  }
}
