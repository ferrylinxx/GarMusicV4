import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/playlists/[id]">) {
  const { id } = await ctx.params;
  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: {
      tracks: {
        include: { track: { include: { uploader: { select: { name: true } } } } },
        orderBy: { order: "asc" },
      },
      user: { select: { name: true } },
    },
  });
  if (!playlist) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ playlist });
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/playlists/[id]">) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await ctx.params;
  const { trackId } = await req.json();

  const playlist = await prisma.playlist.findUnique({ where: { id } });
  if (!playlist || playlist.userId !== session.user.id) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const count = await prisma.playlistTrack.count({ where: { playlistId: id } });
  const pt = await prisma.playlistTrack.upsert({
    where: { playlistId_trackId: { playlistId: id, trackId } },
    update: {},
    create: { playlistId: id, trackId, order: count },
  });

  return NextResponse.json({ playlistTrack: pt }, { status: 201 });
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/playlists/[id]">) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const trackId = searchParams.get("trackId");

  const playlist = await prisma.playlist.findUnique({ where: { id } });
  if (!playlist || playlist.userId !== session.user.id) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  if (trackId) {
    await prisma.playlistTrack.delete({
      where: { playlistId_trackId: { playlistId: id, trackId } },
    });
  } else {
    await prisma.playlist.delete({ where: { id } });
  }

  return NextResponse.json({ success: true });
}
