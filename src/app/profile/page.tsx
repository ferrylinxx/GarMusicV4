"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePlayerStore } from "@/store/player";
import { useToast } from "@/context/ToastContext";
import { Music2, Heart, Clock, ListMusic, Crown, Camera, Loader2, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Tab = "overview" | "playlists" | "liked" | "settings";
interface Track { id: string; title: string; artist: string; coverUrl?: string; duration: number; plays: number; fileUrl: string; }
interface Playlist { id: string; name: string; _count: { tracks: number }; coverUrl?: string; }
interface ProfileData {
  user: { id: string; name?: string; email: string; image?: string; bio?: string; role: string };
  stats: { liked: number; listens: number; playlists: number };
  playlists: Playlist[];
  topTracks: Track[];
}

function fmt(s: number) { return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`; }

export default function ProfilePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ProfileData | null>(null);
  const [liked, setLiked] = useState<Track[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const { setQueue } = usePlayerStore();
  const { success, error: toastError } = useToast();
  const avatarRef = useRef<HTMLInputElement>(null);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [avatarLoad, setAvatarLoad] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((d) => {
      setData(d); setEditName(d.user?.name ?? ""); setEditBio(d.user?.bio ?? ""); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "liked" && liked.length === 0) {
      fetch("/api/liked").then((r) => r.json()).then(setLiked).catch(() => {});
    }
  }, [tab, liked.length]);

  const saveProfile = async () => {
    setSaving(true);
    const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: editName, bio: editBio }) });
    setSaving(false);
    if (res.ok) { success("Perfil actualizado"); setData((d) => d ? { ...d, user: { ...d.user, name: editName, bio: editBio } } : d); }
    else toastError("Error al guardar");
  };

  const changePwd = async () => {
    setSavingPwd(true);
    const res = await fetch("/api/profile/password", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: curPwd, newPassword: newPwd }) });
    setSavingPwd(false);
    const d = await res.json();
    if (res.ok) { success("Contraseña actualizada"); setCurPwd(""); setNewPwd(""); }
    else toastError(d.error ?? "Error al cambiar la contraseña");
  };

  const uploadAvatar = async (file: File) => {
    setAvatarLoad(true);
    const fd = new FormData(); fd.append("avatar", file);
    const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
    setAvatarLoad(false);
    if (res.ok) { const d = await res.json(); setData((p) => p ? { ...p, user: { ...p.user, image: d.image } } : p); success("Foto actualizada"); }
    else toastError("Error al subir la foto");
  };

  const initials = session?.user?.name?.[0]?.toUpperCase() ?? session?.user?.email?.[0]?.toUpperCase() ?? "U";
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Resumen" }, { id: "playlists", label: "Playlists" },
    { id: "liked", label: "Me gusta" }, { id: "settings", label: "Ajustes" },
  ];

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="pb-8">
      <div className="bg-gradient-to-b from-green-900/40 to-transparent px-6 pt-10 pb-6">
        <div className="flex items-end gap-5">
          <div className="relative group flex-shrink-0">
            <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-2xl">
              {data?.user.image
                ? <Image src={data.user.image} alt="Avatar" fill className="object-cover" unoptimized />
                : <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-4xl font-black text-black">{initials}</div>}
            </div>
            <button onClick={() => avatarRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              {avatarLoad ? <Loader2 size={20} className="text-white animate-spin" /> : <Camera size={20} className="text-white" />}
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]); }} />
          </div>
          <div>
            {isAdmin && <div className="flex items-center gap-1.5 mb-1"><Crown size={13} className="text-green-400" /><span className="text-green-400 text-xs font-bold uppercase tracking-wider">Administrador</span></div>}
            <h1 className="text-3xl font-black text-white">{data?.user.name ?? "Mi Perfil"}</h1>
            <p className="text-white/40 text-sm mt-0.5">{data?.user.email}</p>
            {data?.user.bio && <p className="text-white/50 text-sm mt-2 max-w-sm">{data.user.bio}</p>}
          </div>
        </div>
        <div className="flex gap-6 mt-5">
          {[{ icon: Heart, label: "Likes", value: data?.stats.liked ?? 0, color: "text-pink-400" }, { icon: Clock, label: "Escuchas", value: data?.stats.listens ?? 0, color: "text-blue-400" }, { icon: ListMusic, label: "Playlists", value: data?.stats.playlists ?? 0, color: "text-purple-400" }].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="text-center"><Icon size={18} className={`${color} mx-auto mb-1`} /><p className="text-white font-bold text-lg">{value}</p><p className="text-white/40 text-xs">{label}</p></div>
          ))}
        </div>
      </div>
      <div className="flex gap-1 px-6 border-b border-white/5 mb-6">
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === id ? "border-green-500 text-white" : "border-transparent text-white/40 hover:text-white"}`}>{label}</button>
        ))}
      </div>
      <div className="px-6">
        {tab === "overview" && data?.topTracks && data.topTracks.length > 0 && (
          <div>
            <h2 className="text-white font-bold text-base mb-3">Más escuchadas</h2>
            <div className="space-y-1">
              {data.topTracks.map((track, i) => (
                <div key={track.id} onClick={() => setQueue([track], 0)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors">
                  <span className="text-white/30 text-sm w-5 text-right">{i + 1}</span>
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">{track.coverUrl ? <Image src={track.coverUrl} alt={track.title} fill className="object-cover" /> : <div className="w-full h-full bg-[#282828] flex items-center justify-center"><Music2 size={12} className="text-white/30" /></div>}</div>
                  <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium truncate">{track.title}</p><p className="text-white/40 text-xs">{track.artist}</p></div>
                  <span className="text-white/30 text-xs">{track.plays} plays</span>
                  <span className="text-white/30 text-xs tabular-nums">{fmt(track.duration)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "playlists" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data?.playlists?.map((pl) => (
              <Link key={pl.id} href={`/playlist/${pl.id}`} className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-colors group">
                <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-green-500/20 to-purple-500/20 flex items-center justify-center mb-3 relative overflow-hidden">
                  {pl.coverUrl ? <Image src={pl.coverUrl} alt={pl.name} fill className="object-cover" /> : <ListMusic size={28} className="text-white/30" />}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Play size={24} className="text-white" fill="white" /></div>
                </div>
                <p className="text-white text-sm font-semibold truncate">{pl.name}</p>
                <p className="text-white/40 text-xs mt-0.5">{pl._count.tracks} canciones</p>
              </Link>
            ))}
            {(!data?.playlists || data.playlists.length === 0) && <div className="col-span-2 sm:col-span-3 flex flex-col items-center justify-center h-32 gap-2 text-white/30"><ListMusic size={32} /><p>No tienes playlists</p></div>}
          </div>
        )}
        {tab === "liked" && (
          <div className="space-y-1">
            {liked.length === 0 && <div className="flex flex-col items-center justify-center h-32 gap-2 text-white/30"><Heart size={32} /><p>No hay canciones favoritas</p></div>}
            {liked.map((track, i) => (
              <div key={track.id} onClick={() => setQueue(liked, i)} className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors">
                <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 shadow">{track.coverUrl ? <Image src={track.coverUrl} alt={track.title} fill className="object-cover" /> : <div className="w-full h-full bg-[#282828] flex items-center justify-center"><Music2 size={14} className="text-white/30" /></div>}</div>
                <div className="flex-1 min-w-0"><p className="text-white text-sm font-semibold truncate group-hover:text-green-400 transition-colors">{track.title}</p><p className="text-white/40 text-xs">{track.artist}</p></div>
                <Heart size={14} className="fill-green-500 text-green-500 flex-shrink-0" />
                <span className="text-white/30 text-xs tabular-nums">{fmt(track.duration)}</span>
              </div>
            ))}
          </div>
        )}
        {tab === "settings" && (
          <div className="space-y-8 max-w-md">
            <div>
              <h2 className="text-white font-bold text-base mb-4">Editar perfil</h2>
              <div className="space-y-3">
                <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nombre" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-green-500/50" />
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Sobre mí (opcional)" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-green-500/50 resize-none" />
                <button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
                  {saving && <Loader2 size={14} className="animate-spin" />} Guardar cambios
                </button>
              </div>
            </div>
            <div className="border-t border-white/5 pt-6">
              <h2 className="text-white font-bold text-base mb-4">Cambiar contraseña</h2>
              <div className="space-y-3">
                <input type="password" value={curPwd} onChange={(e) => setCurPwd(e.target.value)} placeholder="Contraseña actual" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-green-500/50" />
                <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Nueva contraseña (mín. 8 caracteres)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-green-500/50" />
                <button onClick={changePwd} disabled={savingPwd || !curPwd || !newPwd} className="flex items-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
                  {savingPwd && <Loader2 size={14} className="animate-spin" />} Cambiar contraseña
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
