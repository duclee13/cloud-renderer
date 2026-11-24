import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cloud Render Control — 2D Animation Factory",
  description:
    "Bảng điều khiển & giám sát trực tiếp dàn 16-20 máy ảo Cloud Render (VieNeu-TTS + Remotion + FFmpeg) trên GitHub Actions.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090d16",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-[#090d16] text-slate-100 selection:bg-sky-500/30 selection:text-sky-100">
        {children}
      </body>
    </html>
  );
}
