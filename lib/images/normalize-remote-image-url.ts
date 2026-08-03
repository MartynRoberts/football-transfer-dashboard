export function normalizeRemoteImageUrl(url: string): string {
  try {
    const normalized = new URL(url);
    normalized.pathname = normalized.pathname.replace(/\/{2,}/g, "/");
    return normalized.toString();
  } catch {
    return url;
  }
}
