import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/tracks/[id]">) {
  const { id } = await ctx.params;
  const track = await prisma.track.findUnique({
    where: { id },
    include: { uploader: { select: { name: true } } },
  });
  if (!track) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ track });
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/tracks/[id]">) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await ctx.params;
  const track = await prisma.track.findUnique({ where: { id } });
  if (!track) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (track.uploadedBy !== session.user.id && (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  let title: string, artist: string, album: string, genre: string, year: string;
  let coverUrl: string | null | undefined = undefined; // undefined = no change

  if (contentType.includes("multipart/form-data")) {
    const fd = await req.formData();
    title  = fd.get("title")  as string;
    artist = fd.get("artist") as string;
    album  = fd.get("album")  as string ?? "";
    genre  = fd.get("genre")  as string ?? "";
    year   = fd.get("year")   as string ?? "";

    const cover = fd.get("cover") as File | null;
    if (cover && cover.size > 0) {
      const uploadsDir = join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true });
      const coverName = `cover_${Date.now()}_${cover.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await writeFile(join(uploadsDir, coverName), Buffer.from(await cover.arrayBuffer()));
      coverUrl = `/uploads/${coverName}`;
    } else if (fd.get("removeCover") === "true") {
      coverUrl = null;
    }
  } else {
    const body = await req.json();
    title  = body.title;
    artist = body.artist;
    album  = body.album  ?? "";
    genre  = body.genre  ?? "";
    year   = body.year   ?? "";
  }

  const updated = await prisma.track.update({
    where: { id },
    data: {
      title,
      artist,
      album:    album  || null,
      genre:    genre  || null,
      year:     year   ? parseInt(year) : null,
      ...(coverUrl !== undefined ? { coverUrl } : {}),
    },
  });

  return NextResponse.json({ track: updated });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/tracks/[id]">) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await ctx.params;
  const track = await prisma.track.findUnique({ where: { id } });
  if (!track) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (track.uploadedBy !== session.user.id && (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  await prisma.track.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
