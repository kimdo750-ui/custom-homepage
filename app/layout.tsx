import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Custom Apparel Designer",
  description: "AI 기반 전사지 디자인 도구",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
