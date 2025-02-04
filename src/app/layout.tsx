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
  title: "Blanc AI Quoting Demo",
  description: "Professional AI Quote Generation System",
  icons: {
    icon: [
      {
        url: "/logo_b_black.png",
        type: "image/png",
        sizes: "32x32"
      },
      {
        url: "/logo_b_black.png",
        type: "image/png",
        sizes: "16x16"
      }
    ],
    shortcut: ["/logo_b_black.png"],
    apple: [
      {
        url: "/logo_b_black.png",
        type: "image/png",
        sizes: "180x180"
      }
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/logo_b_black.png"
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/logo_b_black.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo_b_black.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo_b_black.png" />
        <link rel="mask-icon" href="/logo_b_black.png" color="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
