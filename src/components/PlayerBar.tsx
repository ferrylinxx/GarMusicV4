"use client";

import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { usePlayerStore } from "@/store/player";
import { useLikes } from "@/hooks/useLikes";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Music2, Heart } from "lucide-react";
import Image from "next/image";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function PlayerBar() {
  const { currentTrack, isPlaying, volume, currentTime, duration, togglePlay, setPlaying, setVolume, setCurrentTime, setDuration, playNext, playPrev } = usePlayerStore();
  const { toggleLike, isLiked } = useLikes();
  const howlRef = useRef<Howl | null>(null);
  const rafRef = useRef<number | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [muted, setMuted] = useState(false);
  const prevVol = useRef(volume);

  useEffect(() => {
    if (!currentTrack) return;
    howlRef.current?.unload();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Incrementar contador de reproducciones
    fetch(`/api/tracks/${currentTrack.id}/play`, { method: "POST" }).catch(() => {});

    const howl = new Howl({
      src: [currentTrack.fileUrl],
      html5: true,
      volume: muted ? 0 : volume,
      onload: () => setDuration(howl.duration()),
      onend: () => { if (repeat) { howl.play(); } else { setPlaying(false); playNext(); } },
      onplay: () => {
        const tick = () => { setCurrentTime(howl.seek() as number); rafRef.current = requestAnimationFrame(tick); };
        rafRef.current = requestAnimationFrame(tick);
      },
      onpause: () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); },
    });
    howlRef.current = howl;
    howl.play();
    return () => { howl.unload(); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  useEffect(() => { if (!howlRef.current) return; isPlaying ? howlRef.current.play() : howlRef.current.pause(); }, [isPlaying]);
  useEffect(() => { howlRef.current?.volume(muted ? 0 : volume); }, [volume, muted]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    howlRef.current?.seek(t);
    setCurrentTime(t);
  };

  const toggleMute = () => {
    if (!muted) { prevVol.current = volume; setMuted(true); }
    else { setMuted(false); setVolume(prevVol.current); }
  };

  const pct = duration ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) {
    return (
      <div className="h-16 md:h-[72px] bg-[#0a0a0a] border-t border-white/5 flex items-center justify-center gap-3">
        <Music2 size={16} className="text-white/20" />
        <p className="text-white/30 text-sm hidden sm:block">Selecciona una canción para empezar</p>
      </div>
    );
  }

  const liked = currentTrack ? isLiked(currentTrack.id) : false;

  return (
    <div className="bg-[#0a0a0a] border-t border-white/5">
      {/* Progress bar — visible en todas las pantallas */}
      <div className="px-0">
        <input type="range" min={0} max={duration || 1} step={0.5} value={currentTime} onChange={handleSeek}
          className="w-full cursor-pointer h-1 md:hidden"
          style={{ background: `linear-gradient(to right, #1db954 ${pct}%, rgba(255,255,255,0.1) ${pct}%)` }} />
      </div>

      {/* ── MÓVIL ── */}
      <div className="flex md:hidden items-center gap-3 px-4 py-2 h-16">
        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow">
          {currentTrack.coverUrl
            ? <Image src={currentTrack.coverUrl} alt={currentTrack.title} fill className="object-cover" />
            : <div className="w-full h-full bg-[#282828] flex items-center justify-center"><Music2 size={14} className="text-white/30" /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{currentTrack.title}</p>
          <p className="text-white/40 text-xs truncate">{currentTrack.artist}</p>
        </div>
        <button onClick={() => currentTrack && toggleLike(currentTrack.id)} className="p-2 transition-transform active:scale-90">
          <Heart size={18} className={liked ? "fill-green-500 text-green-500" : "text-white/40"} />
        </button>
        <button onClick={playPrev} className="p-1 text-white/60 active:scale-90 transition-transform">
          <SkipBack size={20} fill="currentColor" />
        </button>
        <button onClick={togglePlay}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow">
          {isPlaying ? <Pause size={18} className="text-black" fill="black" /> : <Play size={18} className="text-black ml-0.5" fill="black" />}
        </button>
        <button onClick={playNext} className="p-1 text-white/60 active:scale-90 transition-transform">
          <SkipForward size={20} fill="currentColor" />
        </button>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:flex items-center h-[88px] px-6 gap-6">
        {/* Info */}
        <div className="flex items-center gap-3 w-72 min-w-0">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
            {currentTrack.coverUrl
              ? <Image src={currentTrack.coverUrl} alt={currentTrack.title} fill className="object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-[#282828] to-[#1a1a1a] flex items-center justify-center"><Music2 size={20} className="text-white/30" /></div>}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-1.5 gap-0.5">
                <span className="playing-bar h-2" /><span className="playing-bar h-3" /><span className="playing-bar h-2" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold truncate">{currentTrack.title}</p>
            <p className="text-white/50 text-xs truncate mt-0.5">{currentTrack.artist}</p>
          </div>
          <button onClick={() => currentTrack && toggleLike(currentTrack.id)} className="flex-shrink-0 transition-transform hover:scale-110">
            <Heart size={16} className={liked ? "fill-green-500 text-green-500" : "text-white/30 hover:text-white/70"} />
          </button>
        </div>
        {/* Controles */}
        <div className="flex-1 flex flex-col items-center gap-2 max-w-lg">
          <div className="flex items-center gap-5">
            <button onClick={() => setShuffle(s => !s)} className={shuffle ? "text-green-500" : "text-white/40 hover:text-white"}><Shuffle size={16} /></button>
            <button onClick={playPrev} className="text-white/70 hover:text-white hover:scale-110 active:scale-95 transition-all"><SkipBack size={20} fill="currentColor" /></button>
            <button onClick={togglePlay} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg">
              {isPlaying ? <Pause size={18} className="text-black" fill="black" /> : <Play size={18} className="text-black ml-0.5" fill="black" />}
            </button>
            <button onClick={playNext} className="text-white/70 hover:text-white hover:scale-110 active:scale-95 transition-all"><SkipForward size={20} fill="currentColor" /></button>
            <button onClick={() => setRepeat(r => !r)} className={repeat ? "text-green-500" : "text-white/40 hover:text-white"}><Repeat size={16} /></button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-white/40 text-[11px] w-8 text-right tabular-nums">{fmt(currentTime)}</span>
            <input type="range" min={0} max={duration || 1} step={0.5} value={currentTime} onChange={handleSeek}
              className="flex-1 cursor-pointer"
              style={{ background: `linear-gradient(to right, #1db954 ${pct}%, rgba(255,255,255,0.15) ${pct}%)` }} />
            <span className="text-white/40 text-[11px] w-8 tabular-nums">{fmt(duration)}</span>
          </div>
        </div>
        {/* Volumen */}
        <div className="flex items-center gap-2 w-36">
          <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors flex-shrink-0">
            {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
            onChange={(e) => { setMuted(false); setVolume(parseFloat(e.target.value)); }}
            className="flex-1 cursor-pointer"
            style={{ background: `linear-gradient(to right, rgba(255,255,255,0.8) ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.15) ${(muted ? 0 : volume) * 100}%)` }} />
        </div>
      </div>
    </div>
  );
}
