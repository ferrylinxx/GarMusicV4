import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const userId = session.user.id;

  const [user, likedCount, listenCount, playlists, topTracks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
    }),
    prisma.likedTrack.count({ where: { userId } }),
    prisma.listenHistory.count({ where: { userId } }),
    prisma.playlist.findMany({
      where: { userId },
      include: { _count: { select: { tracks: true } } },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.listenHistory.groupBy({
      by: ["trackId"],
      where: { userId },
      _count: { trackId: true },
      orderBy: { _count: { trackId: "desc" } },
      take: 5,
    }),
  ]);

  const topTrackIds = topTracks.map((t: { trackId: string }) => t.trackId);
  const topTrackDetails = await prisma.track.findMany({
    where: { id: { in: topTrackIds } },
    select: { id: true, title: true, artist: true, coverUrl: true, duration: true, plays: true },
  });

  // Ordenar por plays descendiente
  const orderedTop = topTrackIds
    .map((id: string) => topTrackDetails.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => t != null);

  return NextResponse.json({
    user,
    stats: { liked: likedCount, listens: listenCount, playlists: playlists.length },
    playlists,
    topTracks: orderedTop,
  });
}
