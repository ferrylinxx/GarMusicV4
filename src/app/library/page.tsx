"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, ListMusic, Heart } from "lucide-react";
import TrackCard from "@/components/TrackCard";
import EditTrackModal from "@/components/EditTrackModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { useLikes } from "@/hooks/useLikes";
import { Track } from "@/store/player";

interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  tracks: { track: Track }[];
}

export default function LibraryPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const { toggleLike, isLiked } = useLikes();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [activeTab, setActiveTab] = useState<"playlists" | "liked">("playlists");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);

  useEffect(() => {
    if (!session) return;
    fetch("/api/playlists").then((r) => r.json()).then((d) => setPlaylists(d.playlists ?? []));
    fetch("/api/likes").then((r) => r.json()).then((d) => setLikedTracks(d.tracks ?? []));
  }, [session]);

  const createPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPlaylistName }),
    });
    const data = await res.json();
    if (res.ok) {
      setPlaylists((prev) => [{ ...data.playlist, tracks: [] }, ...prev]);
      setNewPlaylistName("");
      setShowForm(false);
    }
    setCreating(false);
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <ListMusic size={64} className="text-[#6a6a6a] mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">Inicia sesión para ver tu biblioteca</h2>
        <a href="/login" className="text-green-500 hover:text-green-400 font-bold">Iniciar sesión →</a>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Tu Biblioteca</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors"
        >
          <Plus size={20} />
          <span className="text-sm font-medium">Nueva playlist</span>
        </button>
      </div>

      {/* Formulario nueva playlist */}
      {showForm && (
        <form onSubmit={createPlaylist} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Nombre de la playlist"
            className="flex-1 bg-[#3e3e3e] text-white px-4 py-2 rounded-md border border-[#535353] focus:border-white focus:outline-none text-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-green-500 text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-green-400 disabled:opacity-60"
          >
            Crear
          </button>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ key: "playlists", label: "Playlists", icon: ListMusic }, { key: "liked", label: "Me gusta", icon: Heart }].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as "playlists" | "liked")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === key ? "bg-white text-black" : "bg-[#282828] text-[#b3b3b3] hover:text-white"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Playlists */}
      {activeTab === "playlists" && (
        <div className="space-y-2">
          {playlists.length === 0 ? (
            <p className="text-[#b3b3b3] text-center py-8">No tienes playlists aún. ¡Crea una!</p>
          ) : (
            playlists.map((pl) => (
              <div key={pl.id} className="bg-[#181818] rounded-lg p-4 hover:bg-[#282828] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#3e3e3e] rounded flex items-center justify-center">
                    <ListMusic size={20} className="text-[#6a6a6a]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{pl.name}</p>
                    <p className="text-[#b3b3b3] text-sm">{pl.tracks.length} canciones</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Liked */}
      {activeTab === "liked" && (
        <div>
          {likedTracks.length === 0 ? (
            <p className="text-[#b3b3b3] text-center py-8">No has dado &quot;me gusta&quot; a ninguna canción</p>
          ) : (
            <div className="bg-white/3 rounded-2xl overflow-hidden border border-white/5">
              {likedTracks.map((track, i) => (
                <TrackCard key={track.id} track={track} tracks={likedTracks} index={i} showIndex
                  isAdmin={isAdmin} onEdit={setEditingTrack} onDelete={setDeletingTrack}
                  onLike={toggleLike} isLiked={isLiked(track.id)} />
              ))}
            </div>
          )}
        </div>
      )}

      {editingTrack && (
        <EditTrackModal track={editingTrack} onClose={() => setEditingTrack(null)}
          onSaved={(updated) => { setLikedTracks(l => l.map(t => t.id === updated.id ? { ...t, ...updated } : t)); setEditingTrack(null); }} />
      )}
      {deletingTrack && (
        <DeleteConfirmModal track={deletingTrack} onClose={() => setDeletingTrack(null)}
          onDeleted={(id) => { setLikedTracks(l => l.filter(t => t.id !== id)); setDeletingTrack(null); }} />
      )}
    </div>
  );
}
