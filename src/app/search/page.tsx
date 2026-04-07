"use client";

import { useState, useRef } from "react";
import { Search, Disc3 } from "lucide-react";
import TrackCard from "@/components/TrackCard";
import EditTrackModal from "@/components/EditTrackModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { useSession } from "next-auth/react";
import { useLikes } from "@/hooks/useLikes";
import { Track } from "@/store/player";

const GENRES = ["Pop", "Rock", "Jazz", "Electronic", "Hip-Hop", "Classical", "R&B", "Metal"];

export default function SearchPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const { toggleLike, isLiked } = useLikes();
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = async (q: string, genre = "") => {
    if (!q.trim() && !genre) { setTracks([]); setSearched(false); return; }
    setLoading(true); setSearched(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (genre) params.set("genre", genre);
    const res = await fetch(`/api/tracks?${params}`);
    const data = await res.json();
    setTracks(data.tracks ?? []);
    setLoading(false);
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val), 350);
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight mb-5">Buscar</h1>
        <div className="relative max-w-lg">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50" />
          <input type="text" value={query} onChange={onInput} autoFocus
            placeholder="Canciones, artistas, álbumes..."
            className="w-full bg-white text-black pl-11 pr-5 py-3.5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg placeholder:text-black/40"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Géneros rápidos */}
      {!searched && (
        <div>
          <h2 className="text-white font-bold text-lg mb-4">Explorar géneros</h2>
          <div className="grid grid-cols-4 gap-3">
            {GENRES.map((g, i) => {
              const colors = ["from-pink-600","from-blue-600","from-yellow-600","from-purple-600","from-orange-600","from-teal-600","from-red-600","from-indigo-600"];
              return (
                <button key={g} onClick={() => { setQuery(g); doSearch("", g); }}
                  className={`bg-gradient-to-br ${colors[i]} to-black/60 rounded-xl p-4 text-left hover:scale-105 transition-transform`}>
                  <p className="text-white font-bold text-sm">{g}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {!loading && searched && tracks.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Disc3 size={48} className="text-white/20 mb-4" />
          <p className="text-white font-bold text-lg mb-1">Sin resultados para &quot;{query}&quot;</p>
          <p className="text-white/40 text-sm">Prueba con otro término</p>
        </div>
      )}

      {/* Resultados */}
      {!loading && tracks.length > 0 && (
        <section className="animate-fade-in">
          <p className="text-white/40 text-sm mb-3">{tracks.length} resultado{tracks.length !== 1 ? "s" : ""}</p>
          <div className="bg-white/3 rounded-2xl overflow-hidden border border-white/5">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <span className="text-white/30 text-xs uppercase tracking-widest w-6">#</span>
              <span className="text-white/30 text-xs uppercase tracking-widest flex-1">Título</span>
              <span className="text-white/30 text-xs uppercase tracking-widest hidden md:block w-32">Álbum</span>
              <span className="text-white/30 text-xs uppercase tracking-widest w-10 text-right">⏱</span>
            </div>
            {tracks.map((track, i) => (
              <TrackCard key={track.id} track={track} tracks={tracks} index={i} showIndex
                isAdmin={isAdmin} onEdit={setEditingTrack} onDelete={setDeletingTrack}
                onLike={toggleLike} isLiked={isLiked(track.id)} />
            ))}
          </div>
        </section>
      )}

      {editingTrack && (
        <EditTrackModal track={editingTrack} onClose={() => setEditingTrack(null)}
          onSaved={(updated) => { setTracks(l => l.map(t => t.id === updated.id ? { ...t, ...updated } : t)); setEditingTrack(null); }} />
      )}
      {deletingTrack && (
        <DeleteConfirmModal track={deletingTrack} onClose={() => setDeletingTrack(null)}
          onDeleted={(id) => { setTracks(l => l.filter(t => t.id !== id)); setDeletingTrack(null); }} />
      )}
    </div>
  );
}
