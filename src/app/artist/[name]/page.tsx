"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePlayerStore } from "@/store/player";
import { Music2, Play } from "lucide-react";
import Image from "next/image";

interface Track {
  id: string; title: string; artist: string; album?: string;
  duration: number; fileUrl: string; coverUrl?: string; genre?: string; plays: number;
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

export default function ArtistPage() {
  const params = useParams();
  const artistName = decodeURIComponent(params.name as string);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { setQueue } = usePlayerStore();

  useEffect(() => {
    fetch(`/api/tracks?search=${encodeURIComponent(artistName)}`)
      .then((r) => r.json())
      .then((data: Track[]) => {
        const filtered = data.filter((t) => t.artist.toLowerCase() === artistName.toLowerCase());
        setTracks(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [artistName]);

  const totalPlays = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);

  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-purple-900/50 to-transparent px-6 pt-16 pb-8">
        <div className="flex items-end gap-5">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl flex-shrink-0">
            <Music2 size={48} className="text-white" />
          </div>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Artista</p>
            <h1 className="text-4xl font-black text-white">{artistName}</h1>
            <p className="text-white/40 text-sm mt-2">
              {tracks.length} canciones · {totalPlays.toLocaleString()} reproducciones
            </p>
          </div>
        </div>

        {tracks.length > 0 && (
          <button
            onClick={() => setQueue(tracks, 0)}
            className="mt-6 flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-full transition-colors shadow-lg"
          >
            <Play size={18} fill="black" /> Reproducir todo
          </button>
        )}
      </div>

      {/* Tracks */}
      <div className="px-6">
        <h2 className="text-white font-bold text-lg mb-3">Canciones</h2>

        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && tracks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-white/30">
            <Music2 size={32} />
            <p>No se encontraron canciones</p>
          </div>
        )}

        <div className="space-y-1">
          {tracks.map((track, i) => (
            <div
              key={track.id}
              onClick={() => setQueue(tracks, i)}
              className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
            >
              <span className="text-white/30 text-sm w-6 text-right tabular-nums">{i + 1}</span>
              <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 shadow">
                {track.coverUrl
                  ? <Image src={track.coverUrl} alt={track.title} fill className="object-cover" />
                  : <div className="w-full h-full bg-[#282828] flex items-center justify-center"><Music2 size={14} className="text-white/30" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate group-hover:text-green-400 transition-colors">{track.title}</p>
                {track.album && <p className="text-white/40 text-xs truncate">{track.album}</p>}
              </div>
              <span className="text-white/30 text-xs hidden sm:block">{track.plays} plays</span>
              <span className="text-white/30 text-xs tabular-nums flex-shrink-0">{fmt(track.duration)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
