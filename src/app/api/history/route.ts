import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const history = await prisma.listenHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { listenedAt: "desc" },
    take: 50,
    include: {
      track: {
        select: { id: true, title: true, artist: true, album: true, duration: true, fileUrl: true, coverUrl: true, genre: true, plays: true },
      },
    },
  });

  return NextResponse.json(history);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { trackId } = await req.json();
  if (!trackId) return NextResponse.json({ error: "trackId requerido" }, { status: 400 });

  await prisma.listenHistory.create({
    data: { userId: session.user.id, trackId },
  });

  return NextResponse.json({ success: true });
}
