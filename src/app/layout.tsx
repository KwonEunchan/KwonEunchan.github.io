// src/app/layout.tsx
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
  title: "권은찬 - 기술 블로그",
  description: "KwonEunchan's TechBlog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* body에 flex flex-col이 적용되어 있으므로, 
        하위 레이아웃에서 flex-1을 사용해 화면을 꽉 채울 수 있습니다. 
      */}
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}