import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import PlayerBar from "@/components/PlayerBar";
import BottomNav from "@/components/BottomNav";
import QueuePanel from "@/components/QueuePanel";
import FullScreenPlayer from "@/components/FullScreenPlayer";
import SessionProvider from "@/components/SessionProvider";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "GarMusic - Tu música, a tu manera",
  description: "Tu plataforma de música personal",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "GarMusic" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="h-full antialiased bg-[#121212] overflow-hidden" suppressHydrationWarning>
        <SessionProvider>
          <ToastProvider>
            <div className="flex flex-col h-screen bg-black">
              <div className="flex flex-1 overflow-hidden min-h-0">
                <Sidebar />
                <main className="flex-1 bg-[#121212] overflow-y-auto">
                  {children}
                </main>
                <QueuePanel />
              </div>
              <PlayerBar />
              <BottomNav />
            </div>
            <FullScreenPlayer />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
