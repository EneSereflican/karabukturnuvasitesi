import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SystemNoticeModal } from "@/components/SystemNoticeModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Turnuva Başvuru Sistemi | 2026 Bahar Sezonu',
  description: 'Kamu Kurumları Bahar Futbol Turnuvası — Resmi Online Başvuru ve Takip Sistemi',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8822707598939084"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        <SystemNoticeModal />
        {children}
      </body>
    </html>
  );
}