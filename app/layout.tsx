import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import Navbar from "@/components/navigation/Navbar";
import { SITE_NAME, SITE_URL } from "@/lib/seo/metadata";

const inter = Inter({
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "100",
  variable: "--font-ibm-plex-mono",
});

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
    images: ["/images/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Football Transfer Analytics`,
    description:
      "Explore football transfers, player performance, injuries, market values and squad analytics across Europe's top five leagues.",
    images: ["/images/logo.png"],
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
    <html
      lang="en"
      className={`${inter.className} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Navbar />

        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
