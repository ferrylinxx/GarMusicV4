import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/albums/[id]/tracks — assign a track to this album
export async function POST(req: NextRequest, ctx: RouteContext<"/api/albums/[id]/tracks">) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const album = await prisma.album.findUnique({ where: { id } });
  if (!album) return NextResponse.json({ error: "Álbum no encontrado" }, { status: 404 });

  const { trackId } = await req.json();
  if (!trackId) return NextResponse.json({ error: "trackId requerido" }, { status: 400 });

  const track = await prisma.track.findUnique({ where: { id: trackId } });
  if (!track) return NextResponse.json({ error: "Canción no encontrada" }, { status: 404 });

  const updated = await prisma.track.update({
    where: { id: trackId },
    data: {
      albumId: id,
      album:   album.name, // sync string field for display compatibility
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/albums/[id]/tracks — remove a track from this album
export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/albums/[id]/tracks">) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const { trackId } = await req.json();
  if (!trackId) return NextResponse.json({ error: "trackId requerido" }, { status: 400 });

  const track = await prisma.track.findUnique({ where: { id: trackId } });
  if (!track || track.albumId !== id) {
    return NextResponse.json({ error: "La canción no pertenece a este álbum" }, { status: 400 });
  }

  const updated = await prisma.track.update({
    where: { id: trackId },
    data: { albumId: null },
  });

  return NextResponse.json(updated);
}
