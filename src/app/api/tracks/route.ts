import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") || "";
  const genre = searchParams.get("genre") || "";

  const tracks = await prisma.track.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { artist: { contains: search, mode: "insensitive" } },
                { album: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        genre ? { genre: { equals: genre, mode: "insensitive" } } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      uploader: { select: { name: true } },
    },
  });

  return NextResponse.json({ tracks });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const track = await prisma.track.findUnique({ where: { id } });
  if (!track) return NextResponse.json({ error: "Canción no encontrada" }, { status: 404 });

  if (track.uploadedBy !== session.user.id && (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  await prisma.track.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
