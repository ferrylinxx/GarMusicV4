import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No se recibió imagen" }, { status: 400 });
    }

    // Permitir JPEG con ambos tipos MIME posibles (jpeg / jpg)
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Formato no permitido. Usa JPG, PNG, WEBP o GIF" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen no puede superar 5 MB" }, { status: 400 });
    }

    // Crear directorio si no existe (mkdir con recursive es idempotente)
    const avatarsDir = join(process.cwd(), "public", "avatars");
    await mkdir(avatarsDir, { recursive: true });

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileName = `avatar_${session.user.id}_${Date.now()}.${ext}`;
    const filePath = join(avatarsDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const imageUrl = `/avatars/${fileName}`;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({ image: imageUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Error al subir el avatar" }, { status: 500 });
  }
}
