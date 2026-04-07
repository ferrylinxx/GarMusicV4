"use client";

import { useEffect, useRef, useState } from "react";
import { Track } from "@/store/player";
import { X, Loader2, Save, ImageIcon, Trash2, Music2 } from "lucide-react";
import Image from "next/image";

interface Props {
  track: Track;
  onClose: () => void;
  onSaved: (updated: Track) => void;
}

const FIELDS: { id: string; label: string; required: boolean; col: number; type?: string }[] = [
  { id: "title",  label: "Título",  required: true,  col: 2 },
  { id: "artist", label: "Artista", required: true,  col: 2 },
  { id: "album",  label: "Álbum",   required: false, col: 1 },
  { id: "genre",  label: "Género",  required: false, col: 1 },
  { id: "year",   label: "Año",     required: false, col: 1, type: "number" },
];

export default function EditTrackModal({ track, onClose, onSaved }: Props) {
  const coverRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title:  track.title,
    artist: track.artist,
    album:  track.album  ?? "",
    genre:  track.genre  ?? "",
    year:   track.year   ? String(track.year) : "",
  });
  const [coverFile,    setCoverFile]    = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [removeCover,  setRemoveCover]  = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleCover = (file: File) => {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setRemoveCover(false);
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setRemoveCover(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.artist.trim()) {
      setError("Título y artista son obligatorios");
      return;
    }
    setLoading(true);
    setError("");

    const fd = new FormData();
    fd.append("title",  form.title);
    fd.append("artist", form.artist);
    fd.append("album",  form.album);
    fd.append("genre",  form.genre);
    fd.append("year",   form.year);
    if (coverFile)        fd.append("cover", coverFile);
    if (removeCover)      fd.append("removeCover", "true");

    const res  = await fetch(`/api/tracks/${track.id}`, { method: "PATCH", body: fd });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
    onSaved(data.track as Track);
    onClose();
  };

  const currentCover = removeCover ? null : (coverPreview ?? track.coverUrl);

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#181818] border border-white/10 rounded-2xl shadow-2xl animate-fade-in overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Music2 size={16} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Editar canción</h2>
              <p className="text-white/30 text-xs mt-0.5 truncate max-w-[260px]">{track.title}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Cover */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
              {currentCover
                ? <Image src={currentCover} alt="portada" fill className="object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={24} className="text-white/20" /></div>}
            </div>
            <div className="space-y-2">
              <button type="button" onClick={() => coverRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-white/8 hover:bg-white/12 text-white text-xs font-medium rounded-lg transition-all">
                <ImageIcon size={13} /> Cambiar portada
              </button>
              {(currentCover) && (
                <button type="button" onClick={handleRemoveCover}
                  className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 text-xs font-medium rounded-lg transition-all">
                  <Trash2 size={13} /> Quitar portada
                </button>
              )}
              <input ref={coverRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCover(f); }} />
            </div>
          </div>

          {/* Campos */}
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map(({ id, label, required, col, type = "text" }) => (
              <div key={id} className={col === 2 ? "col-span-2" : "col-span-1"}>
                <label className="block text-white/50 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                  {label}{required && <span className="text-green-500 ml-0.5">*</span>}
                </label>
                <input
                  type={type}
                  value={form[id as keyof typeof form]}
                  onChange={(e) => setForm(f => ({ ...f, [id]: e.target.value }))}
                  placeholder={label}
                  className="w-full bg-white/5 text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-green-500/50 focus:outline-none focus:bg-white/8 placeholder:text-white/20 text-sm transition-all"
                />
              </div>
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Guardando...</>
                : <><Save size={15} /> Guardar cambios</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
