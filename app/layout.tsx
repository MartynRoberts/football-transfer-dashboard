import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navigation/Navbar";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "TransferDashboard",
  description: "Football transfer analytics dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar />

        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
