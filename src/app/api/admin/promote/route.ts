import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Cambiar role de usuario (ADMIN ↔ USER)
export async function POST(req: NextRequest) {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const { userId, role } = await req.json();
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });

  // Si no hay admins aún → cualquiera puede crear el primero
  if (adminCount > 0 && !isAdmin) {
    return NextResponse.json({ error: "Solo un administrador puede cambiar roles" }, { status: 403 });
  }

  const selfId = (session?.user as { id?: string })?.id;
  const target = userId ?? selfId;
  if (!target) return NextResponse.json({ error: "Usuario no especificado" }, { status: 400 });

  const newRole = role ?? "ADMIN";
  const user = await prisma.user.update({
    where: { id: target },
    data: { role: newRole },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ user });
}

