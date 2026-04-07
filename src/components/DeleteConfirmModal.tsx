"use client";

import { useState } from "react";
import { Track } from "@/store/player";
import { Trash2, X, Loader2, AlertTriangle } from "lucide-react";

interface Props {
  track: Track;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export default function DeleteConfirmModal({ track, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/tracks/${track.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al eliminar");
      return;
    }
    onDeleted(track.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-sm bg-[#181818] border border-white/10 rounded-2xl shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
              <Trash2 size={15} className="text-red-400" />
            </div>
            <span className="text-white font-bold text-sm">Eliminar canción</span>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 bg-red-500/8 border border-red-500/15 rounded-xl p-4">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm font-semibold mb-1">¿Eliminar esta canción?</p>
              <p className="text-white/50 text-xs">
                <span className="text-white/80 font-medium">&ldquo;{track.title}&rdquo;</span>
                {" "}de <span className="text-white/80 font-medium">{track.artist}</span> se eliminará permanentemente.
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Botones */}
          <div className="flex gap-2.5">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium transition-all">
              Cancelar
            </button>
            <button onClick={handleDelete} disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Eliminando...</>
                : <><Trash2 size={14} /> Eliminar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
