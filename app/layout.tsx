import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import Navbar from "@/components/navigation/Navbar";

const inter = Inter({
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "100",
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "TransferDashboard",
  description: "Football transfer analytics dashboard",
  appleWebApp: {
    title: "TransferDashboard",
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
      <body className="min-h-full flex flex-col">
        <Navbar />

        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
