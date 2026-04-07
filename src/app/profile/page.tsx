"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePlayerStore } from "@/store/player";
import { Music2, Heart, Clock, ListMusic, Crown } from "lucide-react";
import Image from "next/image";

interface ProfileData {
  user: { id: string; name?: string; email: string; image?: string; role: string; createdAt: string };
  stats: { liked: number; listens: number; playlists: number };
  playlists: { id: string; name: string; _count: { tracks: number } }[];
  topTracks: { id: string; title: string; artist: string; coverUrl?: string; duration: number; plays: number }[];
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { setQueue } = usePlayerStore();

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const initials = session?.user?.name?.[0]?.toUpperCase() ?? session?.user?.email?.[0]?.toUpperCase() ?? "U";
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-b from-green-900/40 to-transparent px-6 pt-10 pb-8">
        <div className="flex items-end gap-5">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-4xl font-black text-black shadow-2xl flex-shrink-0">
            {initials}
          </div>
          <div>
            {isAdmin && (
              <div className="flex items-center gap-1.5 mb-1">
                <Crown size={13} className="text-green-400" />
                <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Administrador</span>
              </div>
            )}
            <h1 className="text-3xl font-black text-white">{session?.user?.name ?? "Mi Perfil"}</h1>
            <p className="text-white/50 text-sm mt-1">{session?.user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-6">
          {[
            { icon: Heart, label: "Likes", value: data?.stats.liked ?? 0, color: "text-pink-400" },
            { icon: Clock, label: "Escuchas", value: data?.stats.listens ?? 0, color: "text-blue-400" },
            { icon: ListMusic, label: "Playlists", value: data?.stats.playlists ?? 0, color: "text-purple-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="text-center">
              <Icon size={18} className={`${color} mx-auto mb-1`} />
              <p className="text-white font-bold text-lg">{value}</p>
              <p className="text-white/40 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Top canciones */}
        {data?.topTracks && data.topTracks.length > 0 && (
          <div>
            <h2 className="text-white font-bold text-lg mb-3">Más escuchadas</h2>
            <div className="space-y-1">
              {data.topTracks.map((track, i) => (
                <div key={track.id} onClick={() => setQueue([{ ...track, fileUrl: "" }], 0)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors">
                  <span className="text-white/30 text-sm w-5 text-right">{i + 1}</span>
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    {track.coverUrl
                      ? <Image src={track.coverUrl} alt={track.title} fill className="object-cover" />
                      : <div className="w-full h-full bg-[#282828] flex items-center justify-center"><Music2 size={12} className="text-white/30" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{track.title}</p>
                    <p className="text-white/40 text-xs truncate">{track.artist}</p>
                  </div>
                  <span className="text-white/30 text-xs">{track.plays} plays</span>
                  <span className="text-white/30 text-xs tabular-nums">{fmt(track.duration)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Playlists */}
        {data?.playlists && data.playlists.length > 0 && (
          <div>
            <h2 className="text-white font-bold text-lg mb-3">Mis playlists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.playlists.map((pl) => (
                <div key={pl.id} className="bg-white/5 hover:bg-white/10 rounded-xl p-4 cursor-pointer transition-colors">
                  <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-green-500/20 to-purple-500/20 flex items-center justify-center mb-3">
                    <ListMusic size={28} className="text-white/30" />
                  </div>
                  <p className="text-white text-sm font-semibold truncate">{pl.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{pl._count.tracks} canciones</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
