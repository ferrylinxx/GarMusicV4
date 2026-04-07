import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// GET /api/albums/[id] — album detail with tracks
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/albums/[id]">) {
  const { id } = await ctx.params;
  const album = await prisma.album.findUnique({
    where: { id },
    include: {
      tracks: {
        orderBy: { title: "asc" },
        select: {
          id: true, title: true, artist: true, album: true,
          duration: true, fileUrl: true, coverUrl: true,
          genre: true, year: true, plays: true, albumId: true,
        },
      },
    },
  });
  if (!album) return NextResponse.json({ error: "Álbum no encontrado" }, { status: 404 });
  return NextResponse.json(album);
}

// PATCH /api/albums/[id] — update album (admin only)
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/albums/[id]">) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const album = await prisma.album.findUnique({ where: { id } });
  if (!album) return NextResponse.json({ error: "Álbum no encontrado" }, { status: 404 });

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let name = album.name, artist = album.artist ?? "", description = album.description ?? "", year = "";
    let coverUrl: string | null | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      name        = (fd.get("name")        as string) || album.name;
      artist      = (fd.get("artist")      as string) ?? "";
      description = (fd.get("description") as string) ?? "";
      year        = (fd.get("year")        as string) ?? "";

      const cover = fd.get("cover") as File | null;
      if (cover && cover.size > 0) {
        const uploadsDir = join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });
        const fname = `album_${Date.now()}_${cover.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        await writeFile(join(uploadsDir, fname), Buffer.from(await cover.arrayBuffer()));
        coverUrl = `/uploads/${fname}`;
      } else if (fd.get("removeCover") === "true") {
        coverUrl = null;
      }
    } else {
      const body = await req.json();
      name        = body.name        ?? album.name;
      artist      = body.artist      ?? "";
      description = body.description ?? "";
      year        = body.year        ?? "";
    }

    const updated = await prisma.album.update({
      where: { id },
      data: {
        name:        name.trim(),
        artist:      artist.trim()      || null,
        description: description.trim() || null,
        year:        year ? parseInt(year) : null,
        ...(coverUrl !== undefined ? { coverUrl } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update album error:", err);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

// DELETE /api/albums/[id] — delete album (admin only), unlinks tracks
export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/albums/[id]">) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { id } = await ctx.params;
  // Unlink tracks first (albumId -> null already handled by onDelete: SetNull in schema)
  await prisma.album.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
