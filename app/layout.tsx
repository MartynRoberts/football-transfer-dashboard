import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navigation/Navbar";
import { SITE_NAME, SITE_URL } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Football Transfer Analytics`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Explore football transfers, player performance, injuries, market values and squad analytics across Europe's top five leagues.",
  applicationName: SITE_NAME,
  category: "sports",
  keywords: [
    "football transfers",
    "transfer analytics",
    "player statistics",
    "market values",
    "football data",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Football Transfer Analytics`,
    description:
      "Explore football transfers, player performance, injuries, market values and squad analytics across Europe's top five leagues.",
    url: "/",
    images: ["/images/logo3.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Football Transfer Analytics`,
    description:
      "Explore football transfers, player performance, injuries, market values and squad analytics across Europe's top five leagues.",
    images: ["/images/logo3.png"],
  },
  appleWebApp: {
    title: SITE_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <Navbar />

        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
