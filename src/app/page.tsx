import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";
import DbSetupBanner from "./DbSetupBanner";

async function fetchData() {
  try {
    const [allTracks, recentTracks, albums] = await Promise.all([
      prisma.track.findMany({ orderBy: { plays: "desc" }, take: 50 }),
      prisma.track.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
      prisma.album.findMany({
        orderBy: { name: "asc" },
        include: {
          tracks: {
            select: {
              id: true, title: true, artist: true, album: true, albumId: true,
              duration: true, fileUrl: true, coverUrl: true, genre: true, year: true, plays: true,
            },
          },
        },
      }),
    ]);
    return { allTracks, recentTracks, albums, dbReady: true };
  } catch {
    return { allTracks: [], recentTracks: [], albums: [], dbReady: false };
  }
}

export default async function HomePage() {
  const { allTracks, recentTracks, albums, dbReady } = await fetchData();

  if (!dbReady) {
    return <DbSetupBanner />;
  }

  return <HomeClient allTracks={allTracks} recentTracks={recentTracks} albums={albums} />;
}
