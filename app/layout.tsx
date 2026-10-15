import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "알바 출퇴근 관리",
  description: "알바생 출퇴근 체크 및 관리자 대시보드",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-ink">{children}</body>
    </html>
  );
}
