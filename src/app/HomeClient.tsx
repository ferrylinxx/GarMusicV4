"use client";

import { useState } from "react";
import TrackCard from "@/components/TrackCard";
import EditTrackModal from "@/components/EditTrackModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { usePlayerStore, Track } from "@/store/player";
import { Play, Music2, Headphones, Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLikes } from "@/hooks/useLikes";
import Image from "next/image";

interface HomeClientProps { recentTracks: Track[]; topTracks: Track[]; }

function MiniTrackCard({ track, tracks, index, isAdmin, onEdit, onDelete }: {
  track: Track; tracks: Track[]; index: number;
  isAdmin?: boolean; onEdit?: (t: Track) => void; onDelete?: (t: Track) => void;
}) {
  const { setQueue, currentTrack, isPlaying } = usePlayerStore();
  const active = currentTrack?.id === track.id;
  return (
    <button
      onClick={() => setQueue(tracks, index)}
      className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/8 cursor-pointer text-left w-full ${active ? "bg-white/8" : ""}`}
    >
      <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0">
        {track.coverUrl
          ? <Image src={track.coverUrl} alt={track.title} fill className="object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-[#333] to-[#1a1a1a] flex items-center justify-center"><Music2 size={14} className="text-white/40" /></div>}
        {active && isPlaying && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-0.5">
            <span className="playing-bar h-2" /><span className="playing-bar h-3" /><span className="playing-bar h-2" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold truncate ${active ? "text-green-400" : "text-white"}`}>{track.title}</p>
        <p className="text-white/40 text-xs truncate">{track.artist}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <Play size={12} className="text-black ml-0.5" fill="black" />
        </div>
        {isAdmin && onEdit && (
          <button onClick={(e) => { e.stopPropagation(); onEdit(track); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
            <Pencil size={12} />
          </button>
        )}
        {isAdmin && onDelete && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(track); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-all">
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </button>
  );
}

export default function HomeClient({ recentTracks: initialRecent, topTracks: initialTop }: HomeClientProps) {
  const { setQueue } = usePlayerStore();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const { toggleLike, isLiked } = useLikes();
  const [recentTracks, setRecentTracks] = useState(initialRecent);
  const [topTracks, setTopTracks] = useState(initialTop);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);

  const handleSaved = (updated: Track) => {
    const update = (list: Track[]) => list.map(t => t.id === updated.id ? { ...t, ...updated } : t);
    setRecentTracks(update);
    setTopTracks(update);
  };

  const handleDeleted = (id: string) => {
    setRecentTracks(l => l.filter(t => t.id !== id));
    setTopTracks(l => l.filter(t => t.id !== id));
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días ☀️";
    if (h < 18) return "Buenas tardes 🎵";
    return "Buenas noches 🌙";
  };

  const isEmpty = recentTracks.length === 0 && topTracks.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
        <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-full flex items-center justify-center mb-6">
          <Headphones size={40} className="text-green-500" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">Tu biblioteca está vacía</h2>
        <p className="text-white/40 mb-8 max-w-xs">El administrador puede subir canciones desde el panel de carga</p>
        <a href="/upload" className="bg-green-500 text-black px-8 py-3 rounded-full font-bold hover:bg-green-400 transition-all hover:scale-105 shadow-lg shadow-green-500/20">
          Subir música
        </a>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* ── Hero ── */}
      <div className="relative px-8 pt-10 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/30 via-[#181818]/60 to-transparent pointer-events-none" />
        <div className="relative">
          <p className="text-white/60 text-sm font-medium mb-1">{greeting()}</p>
          <h1 className="text-4xl font-black text-white mb-1 tracking-tight">Tu música</h1>
          <p className="text-white/40 text-sm">{recentTracks.length} canciones en la biblioteca</p>
        </div>
      </div>

      <div className="px-6 pb-8 space-y-8">
        {/* ── Top escuchado – grid de mini cards ── */}
        {topTracks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-xl">🔥 Lo más escuchado</h2>
              <button onClick={() => setQueue(topTracks, 0)}
                className="flex items-center gap-2 bg-green-500 text-black text-sm font-bold px-4 py-1.5 rounded-full hover:bg-green-400 transition-all hover:scale-105 shadow shadow-green-500/30">
                <Play size={13} fill="black" /> Reproducir todo
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {topTracks.slice(0, 8).map((track, i) => (
                <MiniTrackCard key={track.id} track={track} tracks={topTracks} index={i}
                  isAdmin={isAdmin} onEdit={setEditingTrack} onDelete={setDeletingTrack} />
              ))}
            </div>
          </section>
        )}

        {/* ── Recientes – lista completa ── */}
        {recentTracks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-xl">🕐 Añadidas recientemente</h2>
              <button onClick={() => setQueue(recentTracks, 0)}
                className="text-white/40 hover:text-white text-sm transition-colors">
                Reproducir todo
              </button>
            </div>
            <div className="bg-white/3 rounded-2xl overflow-hidden border border-white/5">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <span className="text-white/30 text-xs uppercase tracking-widest w-6">#</span>
                <span className="text-white/30 text-xs uppercase tracking-widest flex-1">Título</span>
                <span className="text-white/30 text-xs uppercase tracking-widest hidden md:block w-32">Álbum</span>
                <span className="text-white/30 text-xs uppercase tracking-widest w-10 text-right">⏱</span>
              </div>
              {recentTracks.map((track, i) => (
                <TrackCard key={track.id} track={track} tracks={recentTracks} index={i} showIndex
                  isAdmin={isAdmin} onEdit={setEditingTrack} onDelete={setDeletingTrack}
                  onLike={toggleLike} isLiked={isLiked(track.id)} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
      {editingTrack && (
        <EditTrackModal track={editingTrack} onClose={() => setEditingTrack(null)} onSaved={handleSaved} />
      )}
      {deletingTrack && (
        <DeleteConfirmModal track={deletingTrack} onClose={() => setDeletingTrack(null)} onDeleted={handleDeleted} />
      )}
    </div>
  );
}
