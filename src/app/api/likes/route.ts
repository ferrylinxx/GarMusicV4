import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type AuthSession = { user?: { id?: string; name?: string | null; email?: string | null } } | null;

function getUserId(session: AuthSession): string | null {
  if (!session?.user) return null;
  return (session.user as { id?: string }).id ?? null;
}

export async function GET() {
  const session = await auth() as AuthSession;
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const liked = await prisma.likedTrack.findMany({
    where: { userId },
    include: { track: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tracks: liked.map((l) => l.track) });
}

export async function POST(req: NextRequest) {
  const session = await auth() as AuthSession;
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { trackId } = body;
  if (!trackId) return NextResponse.json({ error: "trackId requerido" }, { status: 400 });

  // Verificar que la canción existe
  const track = await prisma.track.findUnique({ where: { id: trackId }, select: { id: true } });
  if (!track) return NextResponse.json({ error: "Canción no encontrada" }, { status: 404 });

  const existing = await prisma.likedTrack.findUnique({
    where: { userId_trackId: { userId, trackId } },
  });

  if (existing) {
    await prisma.likedTrack.delete({ where: { userId_trackId: { userId, trackId } } });
    return NextResponse.json({ liked: false });
  }

  await prisma.likedTrack.create({ data: { userId, trackId } });
  return NextResponse.json({ liked: true });
}
