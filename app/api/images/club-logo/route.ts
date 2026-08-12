import { NextRequest, NextResponse } from "next/server";
import { normalizeRemoteImageUrl } from "@/lib/images/normalize-remote-image-url";

const ALLOWED_HOSTS = new Set([
  "tmssl.akamaized.net",
  "img.a.transfermarkt.technology",
]);

function fallbackResponse() {
  return new NextResponse(null, {
    status: 404,
    headers: {
      "Cache-Control": "public, max-age=60",
    },
  });
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("url");

  if (!source) return fallbackResponse();

  try {
    const imageUrl = new URL(normalizeRemoteImageUrl(source));

    if (imageUrl.protocol !== "https:" || !ALLOWED_HOSTS.has(imageUrl.hostname)) {
      return fallbackResponse();
    }

    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(5000),
      headers: {
        Accept: "image/avif,image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://www.transfermarkt.co.uk/",
        "User-Agent":
          "Mozilla/5.0 (compatible; TransferDashboard/1.0; +https://football-transfer-dashboard.vercel.app)",
      },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok || !contentType.startsWith("image/")) {
      return fallbackResponse();
    }

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      },
    });
  } catch {
    return fallbackResponse();
  }
}
