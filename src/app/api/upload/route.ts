import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if ((session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Solo los administradores pueden subir música" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const artist = formData.get("artist") as string;
    const album = formData.get("album") as string;
    const genre = formData.get("genre") as string;
    const year = formData.get("year") as string;
    const duration = parseInt(formData.get("duration") as string) || 0;

    if (!file || !title || !artist) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/flac", "audio/wav", "audio/ogg"];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|flac|wav|ogg)$/i)) {
      return NextResponse.json({ error: "Formato de audio no permitido" }, { status: 400 });
    }

    // Guardar archivo en public/uploads
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${timestamp}_${safeName}`;
    const filePath = join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Guardar cover si viene
    let coverUrl: string | null = null;
    const cover = formData.get("cover") as File | null;
    if (cover && cover.size > 0) {
      const coverName = `cover_${timestamp}_${cover.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const coverPath = join(uploadsDir, coverName);
      const coverBytes = await cover.arrayBuffer();
      await writeFile(coverPath, Buffer.from(coverBytes));
      coverUrl = `/uploads/${coverName}`;
    }

    const track = await prisma.track.create({
      data: {
        title,
        artist,
        album: album || null,
        genre: genre || null,
        year: year ? parseInt(year) : null,
        duration,
        fileUrl: `/uploads/${fileName}`,
        coverUrl,
        uploadedBy: session.user.id!,
      },
    });

    return NextResponse.json({ track }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
  }
}
