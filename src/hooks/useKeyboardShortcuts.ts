"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/store/player";

interface Options {
  onLike?: () => void;
  onSeek?: (delta: number) => void;
}

export function useKeyboardShortcuts({ onLike, onSeek }: Options = {}) {
  const { togglePlay, playNext, playPrev, setVolume, volume, toggleShuffle, toggleRepeat } =
    usePlayerStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      // No capturar si el usuario está escribiendo
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          if (e.shiftKey) { playNext(); }
          else { onSeek?.(5); }
          break;
        case "ArrowLeft":
          if (e.shiftKey) { playPrev(); }
          else { onSeek?.(-5); }
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case "KeyL":
          onLike?.();
          break;
        case "KeyS":
          if (e.ctrlKey || e.metaKey) break;
          toggleShuffle();
          break;
        case "KeyR":
          if (e.ctrlKey || e.metaKey) break;
          toggleRepeat();
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay, playNext, playPrev, setVolume, volume, toggleShuffle, toggleRepeat, onLike, onSeek]);
}
