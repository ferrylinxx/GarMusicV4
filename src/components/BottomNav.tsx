"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Clock, User } from "lucide-react";
import { useSession } from "next-auth/react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const items = [
    { href: "/",        label: "Inicio",    icon: Home },
    { href: "/search",  label: "Buscar",    icon: Search },
    { href: "/library", label: "Biblioteca",icon: Library },
    { href: "/history", label: "Historial", icon: Clock },
    { href: "/profile", label: "Perfil",    icon: User },
  ];

  // Ocultar en páginas de login/register
  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <nav className="md:hidden flex-shrink-0 flex items-center justify-around bg-black border-t border-white/8 px-1 pb-safe">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all min-w-0 flex-1
              ${active ? "text-green-400" : "text-white/35 hover:text-white/70"}`}
          >
            <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
