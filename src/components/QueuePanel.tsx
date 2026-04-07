"use client";

import { usePlayerStore } from "@/store/player";
import { X, Music2, GripVertical, Trash2 } from "lucide-react";
import Image from "next/image";

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

export default function QueuePanel() {
  const { queue, currentTrack, showQueue, toggleQueue, setQueue, removeFromQueue } = usePlayerStore();

  if (!showQueue) return null;

  const currentIdx = queue.findIndex((t) => t.id === currentTrack?.id);
  const upcoming = queue.slice(currentIdx + 1);
  const played = queue.slice(0, currentIdx);

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-[#121212] border-l border-white/8 z-50 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h2 className="text-white font-bold text-base">Cola de reproducción</h2>
        <button onClick={toggleQueue} className="text-white/40 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Canción actual */}
        {currentTrack && (
          <div className="mt-4 mb-2">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2 font-semibold">Reproduciendo ahora</p>
            <QueueItem track={currentTrack} active />
          </div>
        )}

        {/* Próximas */}
        {upcoming.length > 0 && (
          <div className="mt-4">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2 font-semibold">Próximas ({upcoming.length})</p>
            {upcoming.map((track) => (
              <QueueItem
                key={track.id}
                track={track}
                onRemove={() => removeFromQueue(track.id)}
                onPlay={() => setQueue(queue, queue.indexOf(track))}
              />
            ))}
          </div>
        )}

        {/* Reproducidas */}
        {played.length > 0 && (
          <div className="mt-4">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2 font-semibold">Historial de cola</p>
            {played.map((track) => (
              <QueueItem
                key={track.id}
                track={track}
                dimmed
                onPlay={() => setQueue(queue, queue.indexOf(track))}
              />
            ))}
          </div>
        )}

        {queue.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-white/30">
            <Music2 size={32} />
            <p className="text-sm">La cola está vacía</p>
          </div>
        )}
      </div>
    </div>
  );
}

function QueueItem({
  track, active, dimmed, onRemove, onPlay,
}: {
  track: { id: string; title: string; artist: string; duration: number; coverUrl?: string | null };
  active?: boolean;
  dimmed?: boolean;
  onRemove?: () => void;
  onPlay?: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 px-2 py-2 rounded-lg group transition-colors
      ${active ? "bg-white/10" : "hover:bg-white/5"} ${dimmed ? "opacity-40" : ""}`}>
      <GripVertical size={14} className="text-white/20 flex-shrink-0 hidden group-hover:block" />
      <div className="relative w-9 h-9 rounded overflow-hidden flex-shrink-0 cursor-pointer" onClick={onPlay}>
        {track.coverUrl
          ? <Image src={track.coverUrl} alt={track.title} fill className="object-cover" />
          : <div className="w-full h-full bg-[#282828] flex items-center justify-center"><Music2 size={12} className="text-white/30" /></div>}
      </div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onPlay}>
        <p className={`text-sm font-medium truncate ${active ? "text-green-400" : "text-white"}`}>{track.title}</p>
        <p className="text-white/40 text-xs truncate">{track.artist}</p>
      </div>
      <span className="text-white/30 text-xs tabular-nums flex-shrink-0">{fmt(track.duration)}</span>
      {onRemove && (
        <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all ml-1">
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
