"use client";

import { useMemo, useState } from "react";
import { usePlayerStore, Track } from "@/store/player";
import { useLikes } from "@/hooks/useLikes";
import { useSession } from "next-auth/react";
import { Play, Pause, Music2, Heart, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import EditTrackModal from "@/components/EditTrackModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

interface DbAlbum { id: string; name: string; artist?: string | null; coverUrl?: string | null; tracks: Track[]; }
interface HomeClientProps { allTracks: Track[]; recentTracks: Track[]; albums: DbAlbum[]; }

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}
function getGradient() {
  const h = new Date().getHours();
  if (h < 12) return "from-amber-800/70";
  if (h < 17) return "from-sky-900/70";
  if (h < 21) return "from-violet-900/70";
  return "from-indigo-950/80";
}

function QuickPickItem({ track, tracks, index, isAdmin, onEdit, onDelete }: {
  track: Track; tracks: Track[]; index: number;
  isAdmin?: boolean; onEdit?: (t: Track) => void; onDelete?: (t: Track) => void;
}) {
  const { setQueue, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const active = currentTrack?.id === track.id;
  return (
    <div
      onClick={() => active ? togglePlay() : setQueue(tracks, index)}
      className={`group relative flex items-center rounded-md overflow-hidden cursor-pointer transition-all
        ${active ? "bg-white/20" : "bg-white/[0.07] hover:bg-white/[0.15]"}`}
    >
      <div className="relative w-16 h-16 flex-shrink-0">
        {track.coverUrl
          ? <Image src={track.coverUrl} alt={track.title} fill className="object-cover" />
          : <div className="w-full h-full bg-[#333] flex items-center justify-center"><Music2 size={18} className="text-white/30" /></div>}
        {active && isPlaying && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-0.5">
            <span className="playing-bar h-2" /><span className="playing-bar h-3" /><span className="playing-bar h-2" />
          </div>
        )}
      </div>
      <p className={`flex-1 text-sm font-bold truncate px-3 ${active ? "text-green-400" : "text-white"}`}>{track.title}</p>
      <div className={`mr-3 flex-shrink-0 w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30 transition-all duration-200
        ${active && isPlaying ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"}`}>
        {active && isPlaying ? <Pause size={14} className="text-black" fill="black" /> : <Play size={14} className="text-black ml-0.5" fill="black" />}
      </div>
      {isAdmin && (
        <div className="flex gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          {onEdit && <button onClick={() => onEdit(track)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white"><Pencil size={11} /></button>}
          {onDelete && <button onClick={() => onDelete(track)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-500/10 text-white/40 hover:text-red-400"><Trash2 size={11} /></button>}
        </div>
      )}
    </div>
  );
}

function TrackScrollCard({ track, tracks, index }: { track: Track; tracks: Track[]; index: number }) {
  const { setQueue, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked } = useLikes();
  const active = currentTrack?.id === track.id;
  return (
    <div className="group flex-shrink-0 w-40 p-3 rounded-xl bg-[#181818] hover:bg-[#282828] transition-colors cursor-pointer"
      onClick={() => active ? togglePlay() : setQueue(tracks, index)}>
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 shadow-xl">
        {track.coverUrl
          ? <Image src={track.coverUrl} alt={track.title} fill className="object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-[#333] to-[#1a1a1a] flex items-center justify-center"><Music2 size={28} className="text-white/20" /></div>}
        {active && isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-1">
            <span className="playing-bar h-3" /><span className="playing-bar h-5" /><span className="playing-bar h-3" />
          </div>
        )}
        <div className={`absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50 transition-all duration-200
          ${active && isPlaying ? "opacity-100 translate-y-0" : "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"}`}>
          {active && isPlaying ? <Pause size={16} className="text-black" fill="black" /> : <Play size={16} className="text-black ml-0.5" fill="black" />}
        </div>
        <button onClick={e => { e.stopPropagation(); toggleLike(track.id); }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1">
          <Heart size={14} className={isLiked(track.id) ? "fill-green-500 text-green-500" : "text-white drop-shadow"} />
        </button>
      </div>
      <p className={`text-sm font-bold truncate ${active ? "text-green-400" : "text-white"}`}>{track.title}</p>
      <p className="text-xs text-white/50 truncate mt-0.5">{track.artist}</p>
    </div>
  );
}

function ArtistCard({ name, tracks }: { name: string; tracks: Track[] }) {
  const { setQueue } = usePlayerStore();
  const cover = tracks.find(t => t.coverUrl)?.coverUrl;
  return (
    <Link href={`/artist/${encodeURIComponent(name)}`}
      className="group flex-shrink-0 w-36 flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors">
      <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-lg">
        {cover
          ? <Image src={cover} alt={name} fill className="object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-700 flex items-center justify-center text-3xl font-black text-white">{name[0]?.toUpperCase()}</div>}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
          <button onClick={e => { e.preventDefault(); setQueue(tracks, 0); }}
            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-xl">
            <Play size={16} className="text-black ml-0.5" fill="black" />
          </button>
        </div>
      </div>
      <p className="text-white text-sm font-bold truncate max-w-[120px] text-center">{name}</p>
      <p className="text-white/40 text-xs -mt-1">Artista</p>
    </Link>
  );
}

function AlbumCard({ album }: { album: DbAlbum }) {
  const { setQueue } = usePlayerStore();
  const cover = album.coverUrl ?? album.tracks.find(t => t.coverUrl)?.coverUrl;
  return (
    <Link href={`/album/${album.id}`}
      className="group flex-shrink-0 w-40 p-3 rounded-xl bg-[#181818] hover:bg-[#282828] transition-colors cursor-pointer">
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 shadow-xl">
        {cover
          ? <Image src={cover} alt={album.name} fill className="object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-[#333] to-[#1a1a1a] flex items-center justify-center"><Music2 size={28} className="text-white/20" /></div>}
        {album.tracks.length > 0 && (
          <button onClick={e => { e.preventDefault(); setQueue(album.tracks, 0); }}
            className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50 transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
            <Play size={16} className="text-black ml-0.5" fill="black" />
          </button>
        )}
      </div>
      <p className="text-sm font-bold text-white truncate">{album.name}</p>
      <p className="text-xs text-white/50 truncate mt-0.5">{album.artist ?? album.tracks[0]?.artist ?? "Varios artistas"}</p>
    </Link>
  );
}

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-6">
        <h2 className="text-white font-black text-xl tracking-tight">{title}</h2>
        {href && <Link href={href} className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Mostrar todo</Link>}
      </div>
      <div className="flex gap-4 overflow-x-auto px-6 pb-2 scrollbar-hide">{children}</div>
    </section>
  );
}

export default function HomeClient({ allTracks, recentTracks, albums }: HomeClientProps) {
  const { setQueue } = usePlayerStore();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);

  const topTracks = useMemo(() => allTracks.slice(0, 20), [allTracks]);
  const quickPicks = topTracks.slice(0, 8);

  const artists = useMemo(() => {
    const map = new Map<string, Track[]>();
    allTracks.forEach(t => { if (!map.has(t.artist)) map.set(t.artist, []); map.get(t.artist)!.push(t); });
    return Array.from(map.entries()).map(([name, tracks]) => ({ name, tracks }));
  }, [allTracks]);

  const userName = session?.user?.name?.split(" ")[0] ?? null;

  if (allTracks.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-full flex items-center justify-center mb-6">
        <Music2 size={40} className="text-green-500" />
      </div>
      <h2 className="text-white text-2xl font-bold mb-2">Biblioteca vacía</h2>
      <p className="text-white/40 mb-8 max-w-xs">Sube canciones desde el panel de administrador</p>
      {isAdmin && <Link href="/upload" className="bg-green-500 text-black px-8 py-3 rounded-full font-bold hover:bg-green-400 transition-all">Subir música</Link>}
    </div>
  );

  return (
    <div className="pb-10">
      {/* Gradient header */}
      <div className={`bg-gradient-to-b ${getGradient()} via-[#121212]/80 to-[#121212] pt-14 pb-6 px-6`}>
        <p className="text-white/60 text-sm font-medium mb-0.5">{getGreeting()}{userName ? `, ${userName}` : ""} 👋</p>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Tu música</h1>
        <p className="text-white/30 text-sm mt-1">{allTracks.length} canciones · {artists.length} artistas</p>
      </div>

      {/* Quick picks */}
      {quickPicks.length > 0 && (
        <div className="px-6 mt-4 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-black text-xl tracking-tight">Selección rápida</h2>
            <button onClick={() => setQueue(topTracks, 0)}
              className="flex items-center gap-1.5 bg-green-500 text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-green-400 transition-all shadow shadow-green-500/30">
              <Play size={12} fill="black" /> Reproducir todo
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {quickPicks.map((track, i) => (
              <QuickPickItem key={track.id} track={track} tracks={quickPicks} index={i}
                isAdmin={isAdmin} onEdit={setEditingTrack} onDelete={setDeletingTrack} />
            ))}
          </div>
        </div>
      )}

      {topTracks.length > 0 && (
        <Section title="Top canciones" href="/search">
          {topTracks.map((track, i) => <TrackScrollCard key={track.id} track={track} tracks={topTracks} index={i} />)}
        </Section>
      )}

      {artists.length > 0 && (
        <Section title="Artistas">
          {artists.map(({ name, tracks }) => <ArtistCard key={name} name={name} tracks={tracks} />)}
        </Section>
      )}

      {albums.length > 0 && (
        <Section title="Álbumes" href="/albums">
          {albums.map(album => <AlbumCard key={album.id} album={album} />)}
        </Section>
      )}

      {recentTracks.length > 0 && (
        <Section title="Añadidas recientemente">
          {recentTracks.map((track, i) => <TrackScrollCard key={track.id} track={track} tracks={recentTracks} index={i} />)}
        </Section>
      )}

      {editingTrack && <EditTrackModal track={editingTrack} onClose={() => setEditingTrack(null)} onSaved={() => setEditingTrack(null)} />}
      {deletingTrack && <DeleteConfirmModal track={deletingTrack} onClose={() => setDeletingTrack(null)} onDeleted={() => setDeletingTrack(null)} />}
    </div>
  );
}
