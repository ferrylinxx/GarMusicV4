"use client";

import { usePlayerStore } from "@/store/player";
import { useLikes } from "@/hooks/useLikes";
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronDown,
  Shuffle, Repeat, Volume2, VolumeX, Music2, ListMusic } from "lucide-react";
import Image from "next/image";

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

export default function FullScreenPlayer() {
  const {
    currentTrack, isPlaying, volume, currentTime, duration,
    isShuffle, isRepeat, showFullScreen,
    togglePlay, playNext, playPrev, toggleShuffle, toggleRepeat,
    setVolume, toggleFullScreen, toggleQueue,
  } = usePlayerStore();
  const { isLiked, toggleLike } = useLikes();

  if (!showFullScreen || !currentTrack) return null;

  const pct = duration ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentTrack.id);

  return (
    <div className="md:hidden fixed inset-0 z-[100] bg-gradient-to-b from-[#1a1a1a] to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe pt-6 pb-4">
        <button onClick={toggleFullScreen} className="text-white/60 hover:text-white">
          <ChevronDown size={28} />
        </button>
        <div className="text-center">
          <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">Reproduciendo</p>
        </div>
        <button onClick={() => { toggleFullScreen(); toggleQueue(); }} className="text-white/60 hover:text-white">
          <ListMusic size={22} />
        </button>
      </div>

      {/* Portada */}
      <div className="flex-1 flex items-center justify-center px-10 py-4">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
          {currentTrack.coverUrl
            ? <Image src={currentTrack.coverUrl} alt={currentTrack.title} fill className="object-cover" />
            : <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                <Music2 size={64} className="text-white/20" />
              </div>}
        </div>
      </div>

      {/* Info + like */}
      <div className="px-6 pb-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white text-xl font-bold truncate">{currentTrack.title}</p>
          <p className="text-white/50 text-sm truncate mt-0.5">{currentTrack.artist}</p>
        </div>
        <button onClick={() => toggleLike(currentTrack.id)} className="p-2 transition-transform active:scale-90">
          <Heart size={24} className={liked ? "fill-green-500 text-green-500" : "text-white/40"} />
        </button>
      </div>

      {/* Progress */}
      <div className="px-6 pb-2">
        <div className="relative h-1.5 bg-white/15 rounded-full overflow-hidden">
          <div className="absolute left-0 top-0 h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-white/40 text-xs tabular-nums">{fmt(currentTime)}</span>
          <span className="text-white/40 text-xs tabular-nums">{fmt(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pb-4 flex items-center justify-between">
        <button onClick={toggleShuffle} className={isShuffle ? "text-green-500" : "text-white/40"}>
          <Shuffle size={22} />
        </button>
        <button onClick={playPrev} className="text-white active:scale-90 transition-transform">
          <SkipBack size={32} fill="currentColor" />
        </button>
        <button onClick={togglePlay}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform">
          {isPlaying
            ? <Pause size={26} className="text-black" fill="black" />
            : <Play size={26} className="text-black ml-1" fill="black" />}
        </button>
        <button onClick={playNext} className="text-white active:scale-90 transition-transform">
          <SkipForward size={32} fill="currentColor" />
        </button>
        <button onClick={toggleRepeat} className={isRepeat ? "text-green-500" : "text-white/40"}>
          <Repeat size={22} />
        </button>
      </div>

      {/* Volume */}
      <div className="px-6 pb-8 flex items-center gap-3">
        <VolumeX size={16} className="text-white/30" />
        <input type="range" min={0} max={1} step={0.01} value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 cursor-pointer"
          style={{ background: `linear-gradient(to right, rgba(255,255,255,0.8) ${volume * 100}%, rgba(255,255,255,0.15) ${volume * 100}%)` }} />
        <Volume2 size={16} className="text-white/30" />
      </div>
    </div>
  );
}
