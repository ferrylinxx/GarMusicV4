import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";
import DbSetupBanner from "./DbSetupBanner";

async function fetchTracks() {
  try {
    const [allTracks, recentTracks] = await Promise.all([
      // Todas las canciones — para derivar top, artistas, álbumes
      prisma.track.findMany({
        orderBy: { plays: "desc" },
        take: 50,
      }),
      // Las más recientes — para la sección "Añadidas recientemente"
      prisma.track.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);
    return { allTracks, recentTracks, dbReady: true };
  } catch {
    return { allTracks: [], recentTracks: [], dbReady: false };
  }
}

export default async function HomePage() {
  const { allTracks, recentTracks, dbReady } = await fetchTracks();

  if (!dbReady) {
    return <DbSetupBanner />;
  }

  return <HomeClient allTracks={allTracks} recentTracks={recentTracks} />;
}
