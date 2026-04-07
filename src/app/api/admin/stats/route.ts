import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const [
    totalUsers,
    totalTracks,
    totalLikes,
    topTracks,
    recentUsers,
    playsTotal,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.track.count(),
    prisma.likedTrack.count(),
    prisma.track.findMany({
      orderBy: { plays: "desc" },
      take: 5,
      select: { id: true, title: true, artist: true, plays: true, coverUrl: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.track.aggregate({ _sum: { plays: true } }),
  ]);

  return NextResponse.json({
    stats: {
      totalUsers,
      totalTracks,
      totalLikes,
      totalPlays: playsTotal._sum.plays ?? 0,
    },
    topTracks,
    recentUsers,
  });
}
