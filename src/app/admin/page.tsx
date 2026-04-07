import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  if (!isAdmin) redirect("/");

  const [totalUsers, totalTracks, totalLikes, playsAgg, topTracks, users] =
    await Promise.all([
      prisma.user.count(),
      prisma.track.count(),
      prisma.likedTrack.count(),
      prisma.track.aggregate({ _sum: { plays: true } }),
      prisma.track.findMany({
        orderBy: { plays: "desc" },
        take: 5,
        select: { id: true, title: true, artist: true, plays: true, coverUrl: true },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
    ]);

  return (
    <AdminClient
      stats={{
        totalUsers,
        totalTracks,
        totalLikes,
        totalPlays: playsAgg._sum.plays ?? 0,
      }}
      topTracks={topTracks}
      initialUsers={users}
      currentUserId={(session!.user as { id: string }).id}
    />
  );
}
