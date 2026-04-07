"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Disc3, Pencil, Trash2, Play, Music2, X, Loader2, Save, ImageIcon, ListMusic } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePlayerStore } from "@/store/player";

interface Track { id: string; title: string; artist: string; album?: string; duration: number; fileUrl: string; coverUrl?: string; genre?: string; year?: number; plays: number; albumId?: string | null; }
interface Album { id: string; name: string; artist?: string; description?: string; coverUrl?: string; year?: number; tracks: Track[]; }

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AlbumsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const { setQueue } = usePlayerStore();

  const [albums, setAlbums]           = useState<Album[]>([]);
  const [allTracks, setAllTracks]     = useState<Track[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showCreate, setShowCreate]   = useState(false);
  const [editAlbum, setEditAlbum]     = useState<Album | null>(null);
  const [manageAlbum, setManageAlbum] = useState<Album | null>(null);
  const [deleting, setDeleting]       = useState<string | null>(null);
  const [search, setSearch]           = useState("");

  const load = async () => {
    setLoading(true);
    const [albumsRes, tracksRes] = await Promise.all([fetch("/api/albums"), fetch("/api/tracks")]);
    if (albumsRes.ok) setAlbums(await albumsRes.json());
    if (tracksRes.ok) setAllTracks(await tracksRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este álbum? Las canciones no se borrarán.")) return;
    setDeleting(id);
    await fetch(`/api/albums/${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  };

  const assignTrack = async (albumId: string, trackId: string) => {
    await fetch(`/api/albums/${albumId}/tracks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trackId }) });
    load();
  };

  const removeTrack = async (albumId: string, trackId: string) => {
    await fetch(`/api/albums/${albumId}/tracks`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trackId }) });
    load();
  };

  const filteredAlbums = albums.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.artist?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="bg-gradient-to-b from-violet-900/50 to-transparent pt-12 pb-6 px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Biblioteca</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Álbumes</h1>
            <p className="text-white/30 text-sm mt-1">{albums.length} álbumes · {albums.reduce((s, a) => s + a.tracks.length, 0)} canciones</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-green-500/30 flex-shrink-0">
              <Plus size={16} /> Nuevo álbum
            </button>
          )}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar álbum..." className="mt-4 w-full max-w-sm bg-white/10 text-white px-4 py-2 rounded-full border border-white/10 focus:border-green-500/50 focus:outline-none text-sm placeholder:text-white/30" />
      </div>

      {/* Albums grid */}
      {filteredAlbums.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-white/30 gap-3">
          <Disc3 size={40} />
          <p>{albums.length === 0 ? "No hay álbumes. ¡Crea el primero!" : "No se encontraron álbumes"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-6 mt-2">
          {filteredAlbums.map(album => (
            <div key={album.id} className="group bg-[#181818] hover:bg-[#282828] transition-colors rounded-xl p-3 flex flex-col gap-2">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#282828] shadow-xl">
                {album.coverUrl ? <Image src={album.coverUrl} alt={album.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Disc3 size={32} className="text-white/15" /></div>}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                  {album.tracks.length > 0 && (
                    <button onClick={() => setQueue(album.tracks, 0)} className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                      <Play size={16} className="text-black ml-0.5" fill="black" />
                    </button>
                  )}
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button onClick={() => setManageAlbum(album)} className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors" title="Gestionar canciones"><ListMusic size={13} className="text-white" /></button>
                      <button onClick={() => setEditAlbum(album)} className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors" title="Editar"><Pencil size={13} className="text-white" /></button>
                      <button onClick={() => handleDelete(album.id)} disabled={deleting === album.id} className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors" title="Eliminar">
                        {deleting === album.id ? <Loader2 size={13} className="text-white animate-spin" /> : <Trash2 size={13} className="text-white" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <Link href={`/album/${album.id}`}>
                <p className="text-white text-sm font-bold truncate hover:text-green-400 transition-colors">{album.name}</p>
              </Link>
              <p className="text-white/40 text-xs truncate -mt-1">{album.artist || "Varios artistas"} · {album.tracks.length} canciones</p>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && <AlbumFormModal onClose={() => setShowCreate(false)} onSaved={load} />}
      {editAlbum  && <AlbumFormModal album={editAlbum} onClose={() => setEditAlbum(null)} onSaved={load} />}
      {manageAlbum && (
        <ManageTracksModal album={manageAlbum} allTracks={allTracks} onClose={() => setManageAlbum(null)}
          onAssign={trackId => assignTrack(manageAlbum.id, trackId)}
          onRemove={trackId => removeTrack(manageAlbum.id, trackId)} />
      )}
    </div>
  );
}

// ── Manage tracks modal ───────────────────────────────────────────────────────
function ManageTracksModal({ album, allTracks, onClose, onAssign, onRemove }: {
  album: Album; allTracks: Track[]; onClose: () => void;
  onAssign: (id: string) => void; onRemove: (id: string) => void;
}) {
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState<string | null>(null);
  const albumTrackIds           = new Set(album.tracks.map(t => t.id));
  const unassigned              = allTracks.filter(t => !albumTrackIds.has(t.id) && (t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase())));

  const handle = async (fn: () => void, id: string) => {
    setLoading(id); await Promise.resolve(fn()); setLoading(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl bg-[#181818] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
          <div><h2 className="text-white font-bold">Gestionar canciones</h2><p className="text-white/40 text-xs mt-0.5">{album.name}</p></div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current tracks */}
          {album.tracks.length > 0 && (
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">En este álbum ({album.tracks.length})</p>
              <div className="space-y-1">
                {album.tracks.map(t => (
                  <div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    {t.coverUrl ? <Image src={t.coverUrl} alt={t.title} width={32} height={32} className="rounded object-cover flex-shrink-0" /> : <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center flex-shrink-0"><Music2 size={12} className="text-white/30" /></div>}
                    <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium truncate">{t.title}</p><p className="text-white/40 text-xs">{t.artist}</p></div>
                    <button onClick={() => handle(onRemove.bind(null, t.id), t.id)} disabled={loading === t.id} className="text-red-400 hover:text-red-300 text-xs font-medium px-2 py-1 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0">
                      {loading === t.id ? <Loader2 size={12} className="animate-spin" /> : "Quitar"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Add tracks */}
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Añadir canciones</p>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar canción..." className="w-full bg-white/5 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-green-500/50 focus:outline-none text-sm mb-2 placeholder:text-white/30" />
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {unassigned.slice(0, 30).map(t => (
                <div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                  {t.coverUrl ? <Image src={t.coverUrl} alt={t.title} width={32} height={32} className="rounded object-cover flex-shrink-0" /> : <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center flex-shrink-0"><Music2 size={12} className="text-white/30" /></div>}
                  <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium truncate">{t.title}</p><p className="text-white/40 text-xs">{t.artist}</p></div>
                  <button onClick={() => handle(onAssign.bind(null, t.id), t.id)} disabled={loading === t.id} className="text-green-400 hover:text-green-300 text-xs font-medium px-2 py-1 hover:bg-green-500/10 rounded-lg transition-all flex-shrink-0 flex items-center gap-1">
                    {loading === t.id ? <Loader2 size={12} className="animate-spin" /> : <><Plus size={12} /> Añadir</>}
                  </button>
                </div>
              ))}
              {unassigned.length === 0 && <p className="text-white/30 text-sm text-center py-4">No hay canciones disponibles</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Album form modal (defined below main for clarity) ─────────────────────────
function AlbumFormModal({ album, onClose, onSaved }: { album?: Album; onClose: () => void; onSaved: () => void }) {
  const coverRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: album?.name ?? "", artist: album?.artist ?? "", description: album?.description ?? "", year: album?.year ? String(album.year) : "" });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("El nombre es obligatorio"); return; }
    setLoading(true); setError("");
    const fd = new FormData();
    fd.append("name",        form.name);
    fd.append("artist",      form.artist);
    fd.append("description", form.description);
    fd.append("year",        form.year);
    if (coverFile) fd.append("cover", coverFile);

    const url    = album ? `/api/albums/${album.id}` : "/api/albums";
    const method = album ? "PATCH" : "POST";
    const res    = await fetch(url, { method, body: fd });
    const data   = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Error"); return; }
    onSaved();
    onClose();
  };

  const currentCover = coverPreview ?? album?.coverUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-[#181818] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-white font-bold">{album ? "Editar álbum" : "Nuevo álbum"}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Cover */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
              {currentCover ? <Image src={currentCover} alt="portada" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Disc3 size={24} className="text-white/20" /></div>}
            </div>
            <div className="space-y-2">
              <button type="button" onClick={() => coverRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-white/8 hover:bg-white/12 text-white text-xs font-medium rounded-lg transition-all">
                <ImageIcon size={13} /> {currentCover ? "Cambiar portada" : "Añadir portada"}
              </button>
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); } }} />
            </div>
          </div>
          {/* Fields */}
          {[
            { id: "name",        label: "Nombre del álbum *", required: true },
            { id: "artist",      label: "Artista",            required: false },
            { id: "description", label: "Descripción",        required: false },
            { id: "year",        label: "Año",                required: false, type: "number" },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-white/50 text-[11px] font-semibold uppercase tracking-wider mb-1">{f.label}</label>
              <input type={f.type ?? "text"} value={form[f.id as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                className="w-full bg-white/5 text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-green-500/50 focus:outline-none text-sm transition-all placeholder:text-white/20"
                placeholder={f.label.replace(" *", "")} />
            </div>
          ))}
          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : <><Save size={14} /> Guardar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
