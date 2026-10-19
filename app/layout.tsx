import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "URL2MD — Website & Video naar Markdown",
  description: "Scrape websites en genereer video-transcripts als schone Markdown. Download of bewerk met AI.",
  keywords: ["markdown", "scraper", "transcript", "youtube", "jina"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontClasses = `${geistSans.variable} ${geistMono.variable} h-full antialiased`;

  return (
    <html lang="nl" className={fontClasses}>
      <body className="min-h-full bg-[#05070a] text-zinc-100">
        {children}
      </body>
    </html>
  );
}
