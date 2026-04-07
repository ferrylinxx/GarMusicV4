"use client";

import { usePlayerStore, Track } from "@/store/player";
import { Play, Pause, Music2, Heart, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

interface TrackCardProps {
  track: Track;
  tracks?: Track[];
  index?: number;
  showIndex?: boolean;
  onLike?: (id: string) => void;
  isLiked?: boolean;
  isAdmin?: boolean;
  onEdit?: (track: Track) => void;
  onDelete?: (track: Track) => void;
}

export default function TrackCard({
  track, tracks, index, showIndex = false,
  onLike, isLiked = false,
  isAdmin = false, onEdit, onDelete,
}: TrackCardProps) {
  const { currentTrack, isPlaying, setQueue, setTrack, togglePlay } = usePlayerStore();
  const active = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (active) togglePlay();
    else if (tracks && index !== undefined) setQueue(tracks, index);
    else setTrack(track);
  };

  return (
    <div
      onDoubleClick={handlePlay}
      className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
        active ? "bg-white/8" : "hover:bg-white/5"
      }`}
    >
      {/* # / Play */}
      <div className="w-7 flex items-center justify-center flex-shrink-0">
        {showIndex && !active && (
          <span className="text-sm text-white/30 group-hover:hidden tabular-nums">{(index ?? 0) + 1}</span>
        )}
        {active && !isPlaying && <span className="text-green-400 text-sm group-hover:hidden">▶</span>}
        {active && isPlaying && (
          <div className="flex items-end gap-0.5 h-4 group-hover:hidden">
            <span className="playing-bar h-2" /><span className="playing-bar h-3.5" /><span className="playing-bar h-2" />
          </div>
        )}
        <button onClick={handlePlay}
          className={`${(showIndex || active) ? "hidden group-hover:flex" : "flex"} items-center justify-center text-white`}>
          {active && isPlaying ? <Pause size={15} fill="white" /> : <Play size={15} fill="white" />}
        </button>
      </div>

      {/* Cover */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
        {track.coverUrl
          ? <Image src={track.coverUrl} alt={track.title} fill className="object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-[#333] to-[#1a1a1a] flex items-center justify-center">
              <Music2 size={14} className="text-white/30" />
            </div>}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${active ? "text-green-400" : "text-white"}`}>{track.title}</p>
        <p className="text-white/40 text-xs truncate mt-0.5">{track.artist}</p>
      </div>

      {/* Album */}
      <p className="text-white/30 text-xs truncate hidden md:block w-28 group-hover:text-white/50 transition-colors">
        {track.album ?? "—"}
      </p>

      {/* Acciones (visibles en hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        {onLike && (
          <button onClick={(e) => { e.stopPropagation(); onLike(track.id); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 transition-all hover:scale-110">
            <Heart size={14} className={isLiked ? "fill-green-500 text-green-500" : "text-white/40 hover:text-white"} />
          </button>
        )}
        {isAdmin && onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(track); }}
            title="Editar canción"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-all hover:scale-110"
          >
            <Pencil size={13} />
          </button>
        )}
        {isAdmin && onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(track); }}
            title="Eliminar canción"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/15 text-white/40 hover:text-red-400 transition-all hover:scale-110"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Duración */}
      <span className="text-white/30 text-xs flex-shrink-0 tabular-nums w-9 text-right group-hover:text-white/50 transition-colors">
        {fmt(track.duration)}
      </span>
    </div>
  );
}
