import type { Metadata } from "next";

export const SITE_NAME = "TransferDashboard";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://football-transfer-dashboard.vercel.app";

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
}

export function createPageMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const socialTitle = `${title} | ${SITE_NAME}`;
  const images = [image || "/images/logo.png"];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      url: canonicalPath,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images,
    },
  };
}
