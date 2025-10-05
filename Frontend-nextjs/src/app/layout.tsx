import type { Metadata } from "next";
import "./globals.css";
import PersistentNavbar from "@/components/PersistentNavbar";

export const metadata: Metadata = {
  title: "ARKHA - NASA Space Apps",
  description: "Design your refuge beyond Earth.",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1",
  colorScheme: "dark",
  other: {
    'preload': '/assets/videos/arkha_homepage.mp4',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-black" style={{ backgroundColor: '#000000' }}>
      <head>
        <link rel="preload" href="/assets/videos/arkha_homepage.mp4" as="video" type="video/mp4" />
        <link rel="preload" href="/assets/videos/arkha_interior.mp4" as="video" type="video/mp4" />
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body {
              background-color: #000000 !important;
              margin: 0;
              padding: 0;
            }
          `
        }} />
      </head>
      <body suppressHydrationWarning className="bg-black h-screen overflow-hidden" style={{ backgroundColor: '#000000' }}>
        <PersistentNavbar />
        <main className="h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#EAFE07]/30 scrollbar-track-transparent hover:scrollbar-thumb-[#EAFE07]/50" style={{marginTop: '80px'}}>
          {children}
        </main>
      </body>
    </html>
  );
}
