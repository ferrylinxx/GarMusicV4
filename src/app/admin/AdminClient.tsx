"use client";

import { useState } from "react";
import {
  Users, Music2, Heart, Play, Shield, UserCheck,
  TrendingUp, Crown, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import Image from "next/image";

interface Stats { totalUsers: number; totalTracks: number; totalLikes: number; totalPlays: number; }
interface TopTrack { id: string; title: string; artist: string; plays: number; coverUrl: string | null; }
interface User { id: string; name: string | null; email: string | null; role: string; createdAt: Date | string; }

interface Props {
  stats: Stats;
  topTracks: TopTrack[];
  initialUsers: User[];
  currentUserId: string;
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-white text-2xl font-black mt-0.5">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

export default function AdminClient({ stats, topTracks, initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showUsers, setShowUsers] = useState(true);
  const [showTop, setShowTop] = useState(true);
  const [search, setSearch] = useState("");

  const toggleRole = async (user: User) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    setLoadingId(user.id);
    const res = await fetch("/api/admin/promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, role: newRole }),
    });
    if (res.ok) {
      const data = await res.json();
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: data.user.role } : u));
    }
    setLoadingId(null);
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const admins = filteredUsers.filter((u) => u.role === "ADMIN");
  const regular = filteredUsers.filter((u) => u.role !== "ADMIN");

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-in space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-500/15 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-green-400" />
        </div>
        <div>
          <h1 className="text-white font-black text-2xl tracking-tight">Panel de Administrador</h1>
          <p className="text-white/30 text-sm">Gestiona usuarios, roles y estadísticas</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users}    label="Usuarios"       value={stats.totalUsers}  color="bg-blue-500/20"   />
        <StatCard icon={Music2}   label="Canciones"      value={stats.totalTracks} color="bg-green-500/20"  />
        <StatCard icon={Heart}    label="Me gusta"       value={stats.totalLikes}  color="bg-pink-500/20"   />
        <StatCard icon={Play}     label="Reproducciones" value={stats.totalPlays}  color="bg-purple-500/20" />
      </div>

      {/* Top Canciones */}
      {topTracks.length > 0 && (
        <section className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          <button onClick={() => setShowTop((v) => !v)}
            className="flex items-center justify-between w-full px-5 py-4 hover:bg-white/3 transition-colors">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-400" />
              <span className="text-white font-bold">Top canciones más escuchadas</span>
            </div>
            {showTop ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
          </button>
          {showTop && (
            <div className="border-t border-white/8">
              {topTracks.map((track, i) => (
                <div key={track.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/4 transition-colors">
                  <span className="text-white/30 text-sm w-5 tabular-nums">{i + 1}</span>
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                    {track.coverUrl
                      ? <Image src={track.coverUrl} alt={track.title} fill className="object-cover" />
                      : <Music2 size={14} className="absolute inset-0 m-auto text-white/20" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{track.title}</p>
                    <p className="text-white/40 text-xs">{track.artist}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Play size={12} className="text-green-400" />
                    <span className="text-white/60 text-sm tabular-nums">{track.plays.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Gestión de usuarios */}
      <section className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        <button onClick={() => setShowUsers((v) => !v)}
          className="flex items-center justify-between w-full px-5 py-4 hover:bg-white/3 transition-colors">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-blue-400" />
            <span className="text-white font-bold">Gestión de usuarios</span>
            <span className="text-white/30 text-sm ml-1">({users.length})</span>
          </div>
          {showUsers ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
        </button>

        {showUsers && (
          <div className="border-t border-white/8">
            {/* Buscador */}
            <div className="px-5 py-3 border-b border-white/5">
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="w-full bg-white/5 text-white px-4 py-2 rounded-xl border border-white/10 focus:border-green-500/50 focus:outline-none text-sm placeholder:text-white/20 transition-all"
              />
            </div>

            {/* Admins primero */}
            {admins.length > 0 && (
              <div>
                <p className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-green-400/70 bg-green-500/5">
                  Administradores
                </p>
                {admins.map((u) => <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} loading={loadingId === u.id} onToggle={toggleRole} />)}
              </div>
            )}
            {/* Usuarios normales */}
            {regular.length > 0 && (
              <div>
                {admins.length > 0 && <p className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-white/30 bg-white/2">Usuarios</p>}
                {regular.map((u) => <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} loading={loadingId === u.id} onToggle={toggleRole} />)}
              </div>
            )}
            {filteredUsers.length === 0 && (
              <p className="text-white/30 text-sm text-center py-8">Sin resultados</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function UserRow({ user, isSelf, loading, onToggle }: { user: User; isSelf: boolean; loading: boolean; onToggle: (u: User) => void; }) {
  const isAdmin = user.role === "ADMIN";
  const initials = user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "?";
  const date = new Date(user.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors border-b border-white/4 last:border-0">
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isAdmin ? "bg-gradient-to-br from-green-400 to-green-600 text-black" : "bg-white/10 text-white"}`}>
        {isAdmin ? <Crown size={14} /> : initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-white text-sm font-semibold truncate">{user.name ?? "Sin nombre"}</p>
          {isSelf && <span className="text-[10px] bg-white/10 text-white/40 px-1.5 py-0.5 rounded-full">Tú</span>}
        </div>
        <p className="text-white/30 text-xs truncate">{user.email}</p>
        <p className="text-white/20 text-[11px] md:hidden mt-0.5">{date}</p>
      </div>

      {/* Fecha (solo desktop) */}
      <p className="text-white/25 text-xs hidden md:block flex-shrink-0">{date}</p>

      {/* Badge role */}
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 hidden sm:block ${isAdmin ? "bg-green-500/15 text-green-400" : "bg-white/8 text-white/40"}`}>
        {isAdmin ? "ADMIN" : "USER"}
      </span>

      {/* Toggle */}
      <button
        onClick={() => onToggle(user)}
        disabled={loading || isSelf}
        title={isSelf ? "No puedes cambiar tu propio rol" : isAdmin ? "Quitar admin" : "Hacer admin"}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed
          ${isAdmin ? "bg-red-500/15 text-red-400 hover:bg-red-500/25" : "bg-green-500/15 text-green-400 hover:bg-green-500/25"}`}
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : isAdmin ? "Quitar admin" : "Hacer admin"}
      </button>
    </div>
  );
}
