import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// GET /api/albums — list all albums with track count
export async function GET() {
  const albums = await prisma.album.findMany({
    orderBy: { name: "asc" },
    include: {
      tracks: {
        select: { id: true, coverUrl: true },
      },
    },
  });
  return NextResponse.json(albums);
}

// POST /api/albums — create album (admin only), supports multipart/form-data
export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let name = "", artist = "", description = "", year = "";
    let coverUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      name        = (fd.get("name")        as string) ?? "";
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
      }
    } else {
      const body = await req.json();
      name        = body.name        ?? "";
      artist      = body.artist      ?? "";
      description = body.description ?? "";
      year        = body.year        ?? "";
    }

    if (!name.trim()) {
      return NextResponse.json({ error: "El nombre del álbum es obligatorio" }, { status: 400 });
    }

    const album = await prisma.album.create({
      data: {
        name:        name.trim(),
        artist:      artist.trim()      || null,
        description: description.trim() || null,
        year:        year ? parseInt(year) : null,
        coverUrl,
      },
    });

    return NextResponse.json(album, { status: 201 });
  } catch (err) {
    console.error("Create album error:", err);
    return NextResponse.json({ error: "Error al crear el álbum" }, { status: 500 });
  }
}
