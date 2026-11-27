import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stickman 2D Studio — 1080p 60FPS Full HD Cloud Video Engine",
  description: "Web Studio & Distributed Cloud Renderer for 2D Stickman Explainer & Storytime Animations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link href="/fonts/be-vietnam-pro.css" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#0A0A0C] text-[#EDEDED] antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
