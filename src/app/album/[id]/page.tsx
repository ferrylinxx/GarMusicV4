"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePlayerStore } from "@/store/player";
import { useSession } from "next-auth/react";
import { Music2, Play, Pause, Disc3, ListMusic } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Track {
  id: string; title: string; artist: string; album?: string;
  duration: number; fileUrl: string; coverUrl?: string; genre?: string; plays: number; year?: number; albumId?: string | null;
}
interface AlbumData {
  id: string; name: string; artist?: string; description?: string; coverUrl?: string; year?: number;
  tracks: Track[];
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

export default function AlbumPage() {
  const params = useParams();
  const rawId = decodeURIComponent(params.id as string);
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const [album, setAlbum]     = useState<AlbumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { setQueue, currentTrack, isPlaying, togglePlay } = usePlayerStore();

  useEffect(() => {
    setLoading(true);
    // Try loading by ID from Album model first
    fetch(`/api/albums/${rawId}`)
      .then(r => {
        if (r.ok) return r.json();
        // Fallback: load by album name string (legacy)
        return fetch(`/api/tracks`)
          .then(r2 => r2.json())
          .then((tracks: Track[]) => {
            const filtered = tracks.filter(t => t.album?.toLowerCase() === rawId.toLowerCase());
            if (filtered.length === 0) { setNotFound(true); return null; }
            return { id: rawId, name: rawId, artist: filtered[0]?.artist, tracks: filtered };
          });
      })
      .then((data: AlbumData | null) => {
        if (data) setAlbum(data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); setNotFound(true); });
  }, [rawId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound || !album) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-white/30">
      <Disc3 size={40} />
      <p>Álbum no encontrado</p>
    </div>
  );

  const tracks = album.tracks;
  const cover  = album.coverUrl ?? tracks.find(t => t.coverUrl)?.coverUrl;
  const total  = tracks.reduce((s, t) => s + t.duration, 0);

  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-b from-violet-900/50 to-transparent px-6 pt-10 pb-8">
        <div className="flex items-end gap-5">
          <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 bg-[#282828]">
            {cover
              ? <Image src={cover} alt={album.name} fill className="object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Disc3 size={48} className="text-white/20" /></div>}
          </div>
          <div className="min-w-0">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Álbum</p>
            <h1 className="text-3xl font-black text-white break-words leading-tight">{album.name}</h1>
            {album.artist && (
              <Link href={`/artist/${encodeURIComponent(album.artist)}`} className="text-white/60 hover:text-white text-sm mt-1.5 inline-block transition-colors font-medium">
                {album.artist}
              </Link>
            )}
            {album.description && <p className="text-white/40 text-xs mt-1 max-w-sm">{album.description}</p>}
            <p className="text-white/30 text-xs mt-1.5">
              {album.year && `${album.year} · `}{tracks.length} canciones · {fmt(total)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          {tracks.length > 0 && (
            <button onClick={() => setQueue(tracks, 0)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-full transition-colors shadow-lg shadow-green-500/30">
              <Play size={18} fill="black" /> Reproducir
            </button>
          )}
          {isAdmin && (
            <Link href="/albums" className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium px-4 py-2 rounded-full border border-white/15 hover:border-white/30 transition-all">
              <ListMusic size={14} /> Gestionar
            </Link>
          )}
        </div>
      </div>

      {/* Track list */}
      <div className="px-4">
        {/* Header */}
        <div className="flex items-center gap-4 px-3 py-2 text-white/30 text-xs uppercase tracking-widest font-semibold border-b border-white/5 mb-1">
          <span className="w-6 text-right">#</span>
          <span className="flex-1">Título</span>
          <span className="hidden sm:block w-20 text-right">Duración</span>
        </div>

        <div className="space-y-0.5">
          {tracks.map((track, i) => {
            const active = currentTrack?.id === track.id;
            return (
              <div key={track.id} onClick={() => active ? togglePlay() : setQueue(tracks, i)}
                className={`group flex items-center gap-4 px-3 py-3 rounded-xl cursor-pointer transition-colors ${active ? "bg-white/10" : "hover:bg-white/5"}`}>
                <div className="w-6 text-right flex-shrink-0">
                  {active && isPlaying
                    ? <div className="flex items-center justify-center gap-0.5 h-4"><span className="playing-bar h-2" /><span className="playing-bar h-3" /><span className="playing-bar h-2" /></div>
                    : <span className={`text-sm tabular-nums group-hover:hidden ${active ? "text-green-400" : "text-white/30"}`}>{i + 1}</span>}
                  <Play size={13} className="hidden group-hover:block text-white mx-auto" fill="white" />
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {track.coverUrl && (
                    <div className="relative w-9 h-9 rounded overflow-hidden flex-shrink-0">
                      <Image src={track.coverUrl} alt={track.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate transition-colors ${active ? "text-green-400" : "text-white group-hover:text-green-400"}`}>{track.title}</p>
                    <p className="text-white/40 text-xs">{track.artist}</p>
                  </div>
                </div>
                <span className="text-white/30 text-xs tabular-nums flex-shrink-0 hidden sm:block">{fmt(track.duration)}</span>
              </div>
            );
          })}
        </div>

        {tracks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-white/30">
            <Music2 size={32} />
            <p>Este álbum no tiene canciones aún</p>
            {isAdmin && <Link href="/albums" className="text-green-400 text-sm hover:underline">Añadir canciones →</Link>}
          </div>
        )}
      </div>
    </div>
  );
}
