"use client";

import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/player";
import { Clock, Music2 } from "lucide-react";
import Image from "next/image";

interface HistoryEntry {
  id: string;
  listenedAt: string;
  track: {
    id: string; title: string; artist: string; album?: string;
    duration: number; fileUrl: string; coverUrl?: string; genre?: string;
  };
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Ahora";
  if (m < 60) return `Hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  const d = Math.floor(h / 24);
  return `Hace ${d}d`;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { setQueue } = usePlayerStore();

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => { setHistory(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const playTrack = (entry: HistoryEntry) => {
    const tracks = history.map((h) => h.track);
    const idx = tracks.findIndex((t) => t.id === entry.track.id);
    setQueue(tracks, idx >= 0 ? idx : 0);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Clock size={28} className="text-green-400" />
        <h1 className="text-2xl font-bold text-white">Escuchado recientemente</h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-white/30">
          <Music2 size={40} />
          <p>No has escuchado nada todavía</p>
        </div>
      )}

      <div className="space-y-1">
        {history.map((entry, i) => (
          <div
            key={entry.id}
            onClick={() => playTrack(entry)}
            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
          >
            <span className="text-white/20 text-sm w-6 text-right tabular-nums">{i + 1}</span>
            <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 shadow">
              {entry.track.coverUrl
                ? <Image src={entry.track.coverUrl} alt={entry.track.title} fill className="object-cover" />
                : <div className="w-full h-full bg-[#282828] flex items-center justify-center"><Music2 size={14} className="text-white/30" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate group-hover:text-green-400 transition-colors">{entry.track.title}</p>
              <p className="text-white/40 text-xs truncate">{entry.track.artist}</p>
            </div>
            <span className="text-white/30 text-xs flex-shrink-0">{timeAgo(entry.listenedAt)}</span>
            <span className="text-white/30 text-xs w-10 text-right tabular-nums flex-shrink-0">{fmt(entry.track.duration)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
