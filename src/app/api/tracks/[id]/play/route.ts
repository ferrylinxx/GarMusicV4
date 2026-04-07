import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Incrementar contador de reproducciones (sin auth — se cuenta siempre)
export async function POST(
  _req: NextRequest,
  ctx: RouteContext<"/api/tracks/[id]/play">
) {
  const { id } = await ctx.params;
  try {
    await prisma.track.update({
      where: { id },
      data: { plays: { increment: 1 } },
    });
    return NextResponse.json({ success: true });
  } catch {
    // Si la canción no existe, ignorar silenciosamente
    return NextResponse.json({ success: false });
  }
}
