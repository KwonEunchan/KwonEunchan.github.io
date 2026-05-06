import type { Metadata } from 'next';
import './styles/globals.scss';
import Header from "@/app/components/header/Header";

export const metadata: Metadata = {
  title: {
    default: "권은찬 - 기술 블로그",
    template: "%s | 기록하며 성장하는 공간" 
  },
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}