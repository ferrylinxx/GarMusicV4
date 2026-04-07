"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/store/player";
import { useToast } from "@/context/ToastContext";
import { Timer, X } from "lucide-react";

const OPTIONS = [15, 30, 45, 60, 90];

export default function SleepTimer() {
  const { sleepTimerEnd, setSleepTimer, setPlaying } = usePlayerStore();
  const { info } = useToast();
  const [open, setOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!sleepTimerEnd) { setRemaining(null); return; }
    const tick = () => {
      const left = Math.max(0, sleepTimerEnd - Date.now());
      setRemaining(left);
      if (left === 0) {
        setPlaying(false);
        setSleepTimer(null);
        info("⏱️ Sleep timer finalizado. Reproducción pausada.");
      }
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [sleepTimerEnd, setPlaying, setSleepTimer, info]);

  const fmtRemaining = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 text-sm px-2 py-1.5 rounded-lg transition-colors
          ${sleepTimerEnd ? "text-green-400 bg-green-400/10" : "text-white/40 hover:text-white hover:bg-white/5"}`}
        title="Sleep timer"
      >
        <Timer size={16} />
        {remaining !== null && (
          <span className="text-xs tabular-nums font-mono">{fmtRemaining(remaining)}</span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-[#282828] rounded-xl shadow-2xl p-3 w-44 z-50 border border-white/10">
          <p className="text-white/50 text-xs uppercase tracking-wider mb-2 px-1">Sleep timer</p>
          {sleepTimerEnd ? (
            <button
              onClick={() => { setSleepTimer(null); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-white/5 text-sm"
            >
              <X size={14} /> Cancelar timer
            </button>
          ) : (
            OPTIONS.map((min) => (
              <button
                key={min}
                onClick={() => { setSleepTimer(min); setOpen(false); info(`⏱️ Pausa en ${min} minutos`); }}
                className="w-full text-left px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white text-sm transition-colors"
              >
                {min} minutos
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
