"use client";

import { useRef, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { Upload, CheckCircle, XCircle, Loader2, X } from "lucide-react";

interface FileStatus {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export default function BulkUpload() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [defaultArtist, setDefaultArtist] = useState("");

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles: FileStatus[] = Array.from(incoming)
      .filter((f) => f.type.startsWith("audio/") || f.name.match(/\.(mp3|wav|flac|ogg|aac|m4a)$/i))
      .map((file) => ({ file, status: "pending" as const }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const uploadAll = async () => {
    if (uploading) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "done") continue;

      setFiles((prev) => prev.map((f, j) => j === i ? { ...f, status: "uploading" } : f));

      const fd = new FormData();
      fd.append("file", files[i].file);
      fd.append("title", files[i].file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
      fd.append("artist", defaultArtist || "Desconocido");
      fd.append("duration", "0");

      // Get duration from audio
      try {
        const url = URL.createObjectURL(files[i].file);
        const audio = new Audio(url);
        const duration = await new Promise<number>((resolve) => {
          audio.onloadedmetadata = () => { resolve(Math.round(audio.duration)); URL.revokeObjectURL(url); };
          audio.onerror = () => resolve(0);
        });
        fd.set("duration", String(duration));
      } catch { /* ignore */ }

      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok) {
          setFiles((prev) => prev.map((f, j) => j === i ? { ...f, status: "done" } : f));
        } else {
          setFiles((prev) => prev.map((f, j) => j === i ? { ...f, status: "error", error: data.error } : f));
        }
      } catch {
        setFiles((prev) => prev.map((f, j) => j === i ? { ...f, status: "error", error: "Error de red" } : f));
      }
    }

    setUploading(false);
    const done = files.filter((f) => f.status !== "error").length;
    const errors = files.filter((f) => f.status === "error").length;
    if (errors === 0) toastSuccess(`✅ ${done} canciones subidas correctamente`);
    else toastError(`${errors} errores al subir. ${done} subidas correctamente.`);
  };

  const remove = (i: number) => setFiles((prev) => prev.filter((_, j) => j !== i));
  const statusIcon = (s: FileStatus["status"]) =>
    s === "done" ? <CheckCircle size={15} className="text-green-400" />
    : s === "error" ? <XCircle size={15} className="text-red-400" />
    : s === "uploading" ? <Loader2 size={15} className="animate-spin text-green-400" />
    : <div className="w-3 h-3 rounded-full bg-white/20" />;

  return (
    <div className="space-y-4">
      <h2 className="text-white font-bold text-lg">Subida masiva</h2>

      <input placeholder="Artista por defecto (opcional)" value={defaultArtist}
        onChange={(e) => setDefaultArtist(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-green-500/50" />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
          ${dragOver ? "border-green-500 bg-green-500/5" : "border-white/15 hover:border-white/30"}`}
      >
        <Upload size={32} className="mx-auto mb-3 text-white/30" />
        <p className="text-white/60 text-sm">Arrastra archivos de audio aquí o haz clic para seleccionar</p>
        <p className="text-white/30 text-xs mt-1">MP3, WAV, FLAC, AAC, OGG soportados</p>
        <input ref={inputRef} type="file" multiple accept="audio/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
      </div>

      {files.length > 0 && (
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5">
              {statusIcon(f.status)}
              <span className="flex-1 text-sm text-white truncate">{f.file.name}</span>
              {f.error && <span className="text-xs text-red-400">{f.error}</span>}
              {f.status === "pending" && (
                <button onClick={() => remove(i)} className="text-white/30 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <button onClick={uploadAll} disabled={uploading || files.every((f) => f.status === "done")}
          className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold text-sm transition-colors flex items-center justify-center gap-2">
          {uploading ? <><Loader2 size={16} className="animate-spin" /> Subiendo...</> : `Subir ${files.filter((f) => f.status !== "done").length} canciones`}
        </button>
      )}
    </div>
  );
}
