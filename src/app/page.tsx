import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";
import DbSetupBanner from "./DbSetupBanner";

async function fetchTracks() {
  try {
    const [recentTracks, topTracks] = await Promise.all([
      prisma.track.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { uploader: { select: { name: true } } },
      }),
      prisma.track.findMany({
        orderBy: { plays: "desc" },
        take: 10,
        include: { uploader: { select: { name: true } } },
      }),
    ]);
    return { recentTracks, topTracks, dbReady: true };
  } catch {
    return { recentTracks: [], topTracks: [], dbReady: false };
  }
}

export default async function HomePage() {
  const { recentTracks, topTracks, dbReady } = await fetchTracks();

  if (!dbReady) {
    return <DbSetupBanner />;
  }

  return <HomeClient recentTracks={recentTracks} topTracks={topTracks} />;
}
