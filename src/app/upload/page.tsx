"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Upload, Music2, Image as ImageIcon, CheckCircle, Loader2, X, Shield, Lock, Layers } from "lucide-react";
import Image from "next/image";
import BulkUpload from "@/components/BulkUpload";

const FIELDS = [
  { id: "title",  label: "Título",   placeholder: "Nombre de la canción", required: true },
  { id: "artist", label: "Artista",  placeholder: "Nombre del artista",   required: true },
  { id: "album",  label: "Álbum",    placeholder: "Nombre del álbum" },
  { id: "genre",  label: "Género",   placeholder: "Pop, Rock, Jazz, Electronic..." },
  { id: "year",   label: "Año",      placeholder: new Date().getFullYear().toString(), type: "number" },
];

export default function UploadPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", artist: "", album: "", genre: "", year: "" });
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleAudio = (file: File) => {
    setAudioFile(file);
    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = () => setDuration(Math.round(audio.duration));
    if (!form.title) setForm(f => ({ ...f, title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") }));
  };

  const handleCover = (file: File) => {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !form.title || !form.artist) { setError("Archivo, título y artista son obligatorios"); return; }
    setLoading(true); setError("");
    const fd = new FormData();
    fd.append("file", audioFile);
    if (coverFile) fd.append("cover", coverFile);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("duration", String(duration));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Error al subir"); return; }
    setSuccess(true);
    setAudioFile(null); setCoverFile(null); setCoverPreview(null);
    setForm({ title: "", artist: "", album: "", genre: "", year: "" }); setDuration(0);
    setTimeout(() => setSuccess(false), 5000);
  };

  if (!session) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
      <Lock size={48} className="text-white/20" />
      <p className="text-white font-bold text-lg">Inicia sesión primero</p>
      <a href="/login" className="text-green-400 hover:text-green-300 text-sm font-semibold">Iniciar sesión →</a>
    </div>
  );

  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8 animate-fade-in">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
        <Shield size={36} className="text-red-400" />
      </div>
      <h2 className="text-white text-xl font-bold">Acceso restringido</h2>
      <p className="text-white/40 max-w-xs text-sm">Solo los administradores pueden subir música a GarMusic.</p>
    </div>
  );

  const [tab, setTab] = useState<"single" | "bulk">("single");

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
          <Shield size={16} className="text-green-400" />
        </div>
        <span className="text-green-400 text-xs font-bold uppercase tracking-widest">Panel de administrador</span>
      </div>
      <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Subir música</h1>
      <p className="text-white/40 text-sm mb-6">Formatos soportados: MP3, FLAC, WAV, OGG</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl mb-6">
        <button onClick={() => setTab("single")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all
          ${tab === "single" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}>
          <Upload size={14} /> Una canción
        </button>
        <button onClick={() => setTab("bulk")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all
          ${tab === "bulk" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}>
          <Layers size={14} /> Subida masiva
        </button>
      </div>

      {tab === "bulk" && <BulkUpload />}
      {tab === "single" && <>

      {success && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-6">
          <CheckCircle size={18} /> <span className="font-semibold">¡Canción subida con éxito!</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6">
          <X size={18} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleAudio(f); }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragOver ? "border-green-500 bg-green-500/10 scale-[1.01]" :
            audioFile ? "border-green-500/50 bg-green-500/5" : "border-white/10 hover:border-white/30 hover:bg-white/3"
          }`}
        >
          <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleAudio(f); }} />
          {audioFile ? (
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Music2 size={22} className="text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">{audioFile.name}</p>
                <p className="text-white/40 text-xs mt-0.5">{(audioFile.size / 1024 / 1024).toFixed(1)} MB · {Math.floor(duration/60)}:{String(duration%60).padStart(2,"0")}</p>
              </div>
            </div>
          ) : (
            <>
              <Upload size={28} className="mx-auto mb-3 text-white/30" />
              <p className="text-white font-semibold">Arrastra tu archivo aquí</p>
              <p className="text-white/30 text-sm mt-1">o haz clic para seleccionar</p>
            </>
          )}
        </div>

        {/* Cover */}
        <div onClick={() => coverRef.current?.click()}
          className="flex items-center gap-4 border border-white/10 hover:border-white/20 rounded-2xl p-4 cursor-pointer transition-all hover:bg-white/3">
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleCover(f); }} />
          {coverPreview
            ? <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"><Image src={coverPreview} alt="cover" fill className="object-cover" /></div>
            : <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0"><ImageIcon size={18} className="text-white/30" /></div>}
          <div>
            <p className="text-white text-sm font-medium">{coverFile ? coverFile.name : "Añadir portada"}</p>
            <p className="text-white/30 text-xs">{coverFile ? `${(coverFile.size/1024).toFixed(0)} KB` : "Opcional · JPG, PNG, WebP"}</p>
          </div>
        </div>

        {/* Campos */}
        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map(({ id, label, placeholder, required, type = "text" }) => (
            <div key={id} className={id === "title" || id === "artist" ? "col-span-2" : ""}>
              <label className="block text-white/60 text-xs font-semibold mb-1.5 uppercase tracking-wider">
                {label}{required && <span className="text-green-500 ml-0.5">*</span>}
              </label>
              <input type={type} value={form[id as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-white/5 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-green-500/50 focus:outline-none focus:bg-white/8 placeholder:text-white/20 text-sm transition-all"
              />
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading || !audioFile}
          className="w-full bg-green-500 text-black font-bold py-3.5 rounded-2xl hover:bg-green-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg shadow-green-500/20 hover:scale-[1.01] active:scale-[0.99]">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Subiendo...</> : <><Upload size={16} /> Subir canción</>}
        </button>
      </form>
      </>}
    </div>
  );
}
