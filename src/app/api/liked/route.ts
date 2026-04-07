import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const liked = await prisma.likedTrack.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      track: {
        select: {
          id: true, title: true, artist: true, album: true,
          duration: true, fileUrl: true, coverUrl: true, genre: true, plays: true,
        },
      },
    },
  });

  return NextResponse.json(liked.map((l) => l.track));
}
