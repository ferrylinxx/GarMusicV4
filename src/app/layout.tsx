import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import PlayerBar from "@/components/PlayerBar";
import BottomNav from "@/components/BottomNav";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "GarMusic - Tu música, a tu manera",
  description: "Tu plataforma de música personal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <body className="h-full antialiased bg-[#121212] overflow-hidden" suppressHydrationWarning>
        <SessionProvider>
          <div className="flex flex-col h-screen bg-black">
            <div className="flex flex-1 overflow-hidden min-h-0">
              {/* Sidebar: solo desktop */}
              <Sidebar />
              {/* Contenido principal */}
              <main className="flex-1 bg-[#121212] overflow-y-auto">
                {children}
              </main>
            </div>
            {/* Player */}
            <PlayerBar />
            {/* Navegación inferior: solo móvil */}
            <BottomNav />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
