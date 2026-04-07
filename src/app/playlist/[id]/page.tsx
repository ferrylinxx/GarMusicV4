"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePlayerStore } from "@/store/player";
import { useToast } from "@/context/ToastContext";
import { Music2, Play, Shuffle, Trash2, ArrowLeft } from "lucide-react";
import Image from "next/image";

interface PlaylistTrack {
  id: string;
  order: number;
  track: { id: string; title: string; artist: string; album?: string; duration: number; fileUrl: string; coverUrl?: string; };
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  user: { name?: string };
  tracks: PlaylistTrack[];
}

function fmt(s: number) { return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`; }

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const { setQueue, toggleShuffle } = usePlayerStore();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    fetch(`/api/playlists/${params.id}`)
      .then((r) => r.json())
      .then((d) => { setPlaylist(d.playlist); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const removeTrack = async (trackId: string) => {
    const res = await fetch(`/api/playlists/${params.id}?trackId=${trackId}`, { method: "DELETE" });
    if (res.ok) {
      setPlaylist((p) => p ? { ...p, tracks: p.tracks.filter((t) => t.track.id !== trackId) } : p);
      success("Canción eliminada de la playlist");
    } else {
      toastError("No se pudo eliminar la canción");
    }
  };

  const deletePlaylist = async () => {
    if (!confirm("¿Eliminar esta playlist?")) return;
    const res = await fetch(`/api/playlists/${params.id}`, { method: "DELETE" });
    if (res.ok) { success("Playlist eliminada"); router.push("/library"); }
    else toastError("No se pudo eliminar");
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!playlist) return <div className="p-8 text-white/40 text-center">Playlist no encontrada</div>;

  const tracks = playlist.tracks.map((pt) => pt.track);
  const totalDuration = tracks.reduce((s, t) => s + t.duration, 0);
  const cover = playlist.coverUrl || tracks.find((t) => t.coverUrl)?.coverUrl;

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/40 to-transparent px-6 pt-6 pb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/40 hover:text-white mb-5 transition-colors text-sm">
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="flex items-end gap-5">
          <div className="relative w-36 h-36 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 bg-[#282828]">
            {cover ? <Image src={cover} alt={playlist.name} fill className="object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Music2 size={40} className="text-white/20" /></div>}
          </div>
          <div className="min-w-0">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Playlist</p>
            <h1 className="text-3xl font-black text-white break-words">{playlist.name}</h1>
            {playlist.description && <p className="text-white/50 text-sm mt-1">{playlist.description}</p>}
            <p className="text-white/30 text-xs mt-2">{tracks.length} canciones · {fmt(totalDuration)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          {tracks.length > 0 && (
            <button onClick={() => setQueue(tracks, 0)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-full transition-colors shadow-lg">
              <Play size={18} fill="black" /> Reproducir
            </button>
          )}
          {tracks.length > 1 && (
            <button onClick={() => { setQueue(tracks, 0); toggleShuffle(); }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-5 py-3 rounded-full transition-colors">
              <Shuffle size={16} /> Aleatorio
            </button>
          )}
          <button onClick={deletePlaylist} className="ml-auto flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 rounded-xl hover:bg-red-400/10 transition-colors text-sm">
            <Trash2 size={15} /> Eliminar playlist
          </button>
        </div>
      </div>

      {/* Track list */}
      <div className="px-6 space-y-1">
        {tracks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-white/30">
            <Music2 size={32} /> <p>Esta playlist está vacía</p>
          </div>
        )}
        {tracks.map((track, i) => (
          <div key={track.id} onClick={() => setQueue(tracks, i)}
            className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors">
            <span className="text-white/30 text-sm w-6 text-right tabular-nums">{i + 1}</span>
            <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 shadow">
              {track.coverUrl ? <Image src={track.coverUrl} alt={track.title} fill className="object-cover" />
                : <div className="w-full h-full bg-[#282828] flex items-center justify-center"><Music2 size={14} className="text-white/30" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate group-hover:text-green-400 transition-colors">{track.title}</p>
              <p className="text-white/40 text-xs truncate">{track.artist}</p>
            </div>
            <span className="text-white/30 text-xs tabular-nums flex-shrink-0">{fmt(track.duration)}</span>
            <button onClick={(e) => { e.stopPropagation(); removeTrack(track.id); }}
              className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all p-1">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
