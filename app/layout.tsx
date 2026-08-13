import type { Metadata } from "next";
import { Geist, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSansSc = Noto_Sans_SC({
  variable: "--font-noto-sc",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mabel’s English Passport｜儿童场景英语",
  description: "为 Mabel 制作的 iPad 英语角色对话冒险，包含 87 个日常与新加坡旅行场景。",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Mabel English",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Mabel’s English Passport",
    description: "87 个日常与新加坡旅行英语角色对话场景",
    type: "website",
    images: [{ url: "/og.png", width: 1792, height: 936, alt: "Mabel 的英语与新加坡旅行冒险" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mabel’s English Passport",
    description: "87 个日常与新加坡旅行英语角色对话场景",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${notoSansSc.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
