"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePlayerStore } from "@/store/player";
import { Music2, Play, Disc3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Track {
  id: string; title: string; artist: string; album?: string;
  duration: number; fileUrl: string; coverUrl?: string; genre?: string; plays: number; year?: number;
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

export default function AlbumPage() {
  const params = useParams();
  const albumId = decodeURIComponent(params.id as string);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { setQueue } = usePlayerStore();

  useEffect(() => {
    fetch(`/api/tracks?search=${encodeURIComponent(albumId)}`)
      .then((r) => r.json())
      .then((data: Track[]) => {
        const filtered = data.filter((t) => t.album?.toLowerCase() === albumId.toLowerCase());
        setTracks(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [albumId]);

  const cover = tracks.find((t) => t.coverUrl)?.coverUrl;
  const artist = tracks[0]?.artist;
  const year = tracks[0]?.year;
  const totalDuration = tracks.reduce((s, t) => s + t.duration, 0);

  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-900/40 to-transparent px-6 pt-10 pb-8">
        <div className="flex items-end gap-5">
          <div className="relative w-36 h-36 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 bg-[#282828]">
            {cover
              ? <Image src={cover} alt={albumId} fill className="object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Disc3 size={48} className="text-white/20" /></div>}
          </div>
          <div className="min-w-0">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Álbum</p>
            <h1 className="text-3xl font-black text-white break-words">{albumId}</h1>
            {artist && (
              <Link href={`/artist/${encodeURIComponent(artist)}`} className="text-white/60 hover:text-white text-sm mt-1 inline-block transition-colors">
                {artist}
              </Link>
            )}
            <p className="text-white/30 text-xs mt-1">
              {year && `${year} · `}{tracks.length} canciones · {fmt(totalDuration)}
            </p>
          </div>
        </div>

        {tracks.length > 0 && (
          <button
            onClick={() => setQueue(tracks, 0)}
            className="mt-6 flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-full transition-colors shadow-lg"
          >
            <Play size={18} fill="black" /> Reproducir álbum
          </button>
        )}
      </div>

      {/* Tracks */}
      <div className="px-6">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="space-y-1">
          {tracks.map((track, i) => (
            <div key={track.id} onClick={() => setQueue(tracks, i)}
              className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors">
              <span className="text-white/30 text-sm w-6 text-right tabular-nums">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate group-hover:text-green-400 transition-colors">{track.title}</p>
                <p className="text-white/40 text-xs">{track.artist}</p>
              </div>
              <span className="text-white/30 text-xs tabular-nums flex-shrink-0">{fmt(track.duration)}</span>
            </div>
          ))}
        </div>

        {!loading && tracks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-white/30">
            <Music2 size={32} />
            <p>No se encontró el álbum</p>
          </div>
        )}
      </div>
    </div>
  );
}
