"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

export function useLikes() {
  const { data: session, status } = useSession();
  // Usar el ID como dependencia primitiva (evita re-render infinito con objetos)
  const userId = (session?.user as { id?: string })?.id ?? null;
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef<string | null>(null); // evitar fetch duplicados

  useEffect(() => {
    // Solo cargar si la sesión está resuelta y hay usuario
    if (status === "loading") return;
    if (!userId) { setLikedIds(new Set()); fetchedRef.current = null; return; }
    // Evitar re-fetch si ya cargamos para este usuario
    if (fetchedRef.current === userId) return;
    fetchedRef.current = userId;

    setLoading(true);
    fetch("/api/likes")
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          console.error("[useLikes] GET /api/likes error:", r.status, err);
          return;
        }
        const data = await r.json();
        const ids = (data.tracks ?? []).map((t: { id: string }) => t.id);
        setLikedIds(new Set(ids));
      })
      .catch((e) => console.error("[useLikes] fetch error:", e))
      .finally(() => setLoading(false));
  }, [userId, status]);

  const toggleLike = useCallback(async (trackId: string) => {
    if (!userId) {
      console.warn("[useLikes] toggleLike llamado sin sesión");
      return;
    }

    const wasLiked = likedIds.has(trackId);

    // Optimistic update
    setLikedIds((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(trackId) : next.add(trackId);
      return next;
    });

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("[useLikes] POST /api/likes error:", res.status, err);
        // Revertir optimistic update
        setLikedIds((prev) => {
          const next = new Set(prev);
          wasLiked ? next.add(trackId) : next.delete(trackId);
          return next;
        });
        return;
      }

      const data = await res.json();
      // Sincronizar con estado real del servidor
      setLikedIds((prev) => {
        const next = new Set(prev);
        data.liked ? next.add(trackId) : next.delete(trackId);
        return next;
      });
    } catch (e) {
      console.error("[useLikes] toggleLike exception:", e);
      // Revertir
      setLikedIds((prev) => {
        const next = new Set(prev);
        wasLiked ? next.add(trackId) : next.delete(trackId);
        return next;
      });
    }
  }, [userId, likedIds]);

  const isLiked = useCallback((trackId: string) => likedIds.has(trackId), [likedIds]);

  return { toggleLike, isLiked, likedIds, loading };
}
