import { create } from "zustand";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  duration: number;
  fileUrl: string;
  coverUrl?: string | null;
  genre?: string | null;
  year?: number | null;
}

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  isRepeat: boolean;
  showQueue: boolean;
  showFullScreen: boolean;
  sleepTimerEnd: number | null; // timestamp ms when timer expires

  setTrack: (track: Track) => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (id: string) => void;
  reorderQueue: (fromIdx: number, toIdx: number) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  playNext: () => void;
  playPrev: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleQueue: () => void;
  toggleFullScreen: () => void;
  setSleepTimer: (minutes: number | null) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,
  duration: 0,
  isShuffle: false,
  isRepeat: false,
  showQueue: false,
  showFullScreen: false,
  sleepTimerEnd: null,

  setTrack: (track) => set({ currentTrack: track, isPlaying: true, currentTime: 0 }),

  setQueue: (tracks, startIndex = 0) =>
    set({ queue: tracks, currentTrack: tracks[startIndex] || null, isPlaying: true, currentTime: 0 }),

  addToQueue: (track) =>
    set((s) => {
      if (s.queue.some((t) => t.id === track.id)) return s;
      return { queue: [...s.queue, track] };
    }),

  removeFromQueue: (id) =>
    set((s) => ({ queue: s.queue.filter((t) => t.id !== id) })),

  reorderQueue: (fromIdx, toIdx) =>
    set((s) => {
      const q = [...s.queue];
      const [moved] = q.splice(fromIdx, 1);
      q.splice(toIdx, 0, moved);
      return { queue: q };
    }),

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setVolume: (volume) => set({ volume }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),
  toggleRepeat: () => set((s) => ({ isRepeat: !s.isRepeat })),
  toggleQueue: () => set((s) => ({ showQueue: !s.showQueue })),
  toggleFullScreen: () => set((s) => ({ showFullScreen: !s.showFullScreen })),

  setSleepTimer: (minutes) =>
    set({ sleepTimerEnd: minutes ? Date.now() + minutes * 60 * 1000 : null }),

  playNext: () => {
    const { queue, currentTrack, isShuffle, isRepeat } = get();
    if (!currentTrack || queue.length === 0) return;
    if (isRepeat) { set({ currentTime: 0, isPlaying: true }); return; }
    if (isShuffle) {
      const others = queue.filter((t) => t.id !== currentTrack.id);
      if (others.length === 0) return;
      const next = others[Math.floor(Math.random() * others.length)];
      set({ currentTrack: next, isPlaying: true, currentTime: 0 });
      return;
    }
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const next = queue[idx + 1] ?? queue[0];
    if (next) set({ currentTrack: next, isPlaying: true, currentTime: 0 });
  },

  playPrev: () => {
    const { queue, currentTrack, currentTime } = get();
    if (!currentTrack || queue.length === 0) return;
    // Si llevamos más de 3s, vuelve al inicio de la canción
    if (currentTime > 3) { set({ currentTime: 0 }); return; }
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const prev = queue[idx - 1] ?? queue[queue.length - 1];
    if (prev) set({ currentTrack: prev, isPlaying: true, currentTime: 0 });
  },
}));
