"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Upload, Music2, LogOut, Shield, ChevronLeft, ChevronRight, LayoutDashboard, Clock, User, Disc3 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const NAV_ITEMS = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/search", label: "Buscar", icon: Search },
    { href: "/library", label: "Tu Biblioteca", icon: Library },
    { href: "/albums", label: "Álbumes", icon: Disc3 },
    { href: "/history", label: "Historial", icon: Clock },
    { href: "/profile", label: "Mi Perfil", icon: User },
    ...(isAdmin ? [
      { href: "/upload", label: "Subir Música", icon: Upload },
      { href: "/admin",  label: "Panel Admin",  icon: LayoutDashboard },
    ] : []),
  ];

  const initials = session?.user?.name?.[0]?.toUpperCase()
    ?? session?.user?.email?.[0]?.toUpperCase()
    ?? "U";

  return (
    <aside
      className="hidden md:flex flex-col h-full bg-black rounded-xl flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? "64px" : "232px" }}
    >
      {/* ── Logo + toggle ── */}
      <div className="flex items-center justify-between px-3 py-4 min-h-[64px]">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5 group flex-1 min-w-0">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <Music2 size={16} className="text-black" strokeWidth={2.5} />
            </div>
            <span className="text-white font-black text-base tracking-tight truncate">GarMusic</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mx-auto shadow-lg shadow-green-500/30 hover:scale-105 transition-transform">
            <Music2 size={16} className="text-black" strokeWidth={2.5} />
          </Link>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-all ml-1 flex-shrink-0"
            title="Colapsar menú"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Botón expandir (solo visible colapsado) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mb-2 w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-all"
          title="Expandir menú"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* ── Nav ── */}
      <nav className="px-2 space-y-0.5 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`relative flex items-center gap-3 rounded-lg transition-all duration-150 group overflow-hidden
                ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}
                ${active ? "text-white bg-white/10" : "text-white/50 hover:text-white hover:bg-white/5"}`}
            >
              {active && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-green-500 rounded-r-full" />
              )}
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} className={active ? "text-white flex-shrink-0" : "flex-shrink-0"} />
              {!collapsed && (
                <>
                  <span className="text-sm font-medium truncate">{label}</span>
                  {href === "/upload" && (
                    <span className="ml-auto text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      ADMIN
                    </span>
                  )}
                </>
              )}
              {collapsed && active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-green-500 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Divisor ── */}
      <div className={`border-t border-white/5 ${collapsed ? "mx-2" : "mx-3"} mb-2`} />

      {/* ── Usuario ── */}
      <div className={`pb-3 space-y-1 ${collapsed ? "px-2" : "px-2"}`}>
        {session?.user ? (
          <>
            {isAdmin && !collapsed && (
              <div className="flex items-center gap-1.5 px-3 py-1">
                <Shield size={11} className="text-green-400" />
                <span className="text-green-400 text-[11px] font-semibold">Administrador</span>
              </div>
            )}
            <div className={`flex items-center rounded-lg bg-white/5 overflow-hidden ${collapsed ? "justify-center p-2" : "gap-2.5 px-2.5 py-2"}`}>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-[11px] font-bold text-black flex-shrink-0">
                {initials}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-semibold truncate">{session.user.name ?? "Usuario"}</p>
                  <p className="text-white/30 text-[10px] truncate">{session.user.email}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title={collapsed ? "Cerrar sesión" : undefined}
              className={`flex items-center w-full rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all
                ${collapsed ? "justify-center py-2.5 px-0" : "gap-3 px-3 py-2"}`}
            >
              <LogOut size={15} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm">Cerrar sesión</span>}
            </button>
          </>
        ) : (
          <Link href="/login"
            className={`flex items-center justify-center text-sm font-bold text-black bg-green-500 rounded-lg hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20
              ${collapsed ? "p-2" : "py-2.5 px-4"}`}
            title={collapsed ? "Iniciar sesión" : undefined}
          >
            {collapsed ? <Music2 size={16} /> : "Iniciar sesión"}
          </Link>
        )}
      </div>
    </aside>
  );
}
