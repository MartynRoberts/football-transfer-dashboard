import { normalizeRemoteImageUrl } from "./normalize-remote-image-url";

export function getClubLogoUrl(url: string): string {
  return `/api/images/club-logo?url=${encodeURIComponent(normalizeRemoteImageUrl(url))}`;
}
