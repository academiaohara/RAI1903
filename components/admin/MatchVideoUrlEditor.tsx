"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isEditorSession } from "@/lib/auth/editor";
import type { User } from "@supabase/supabase-js";

type MatchVideoUrlEditorProps = {
  fixtureId: number;
  initialUrl?: string | null;
  className?: string;
};

export function MatchVideoUrlEditor({ fixtureId, initialUrl, className }: MatchVideoUrlEditorProps) {
  const [user, setUser] = useState<User | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [url, setUrl] = useState(initialUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      void isEditorSession(data.user).then(setCanEdit);
    });
  }, []);

  const save = useCallback(async () => {
    if (!canEdit) return;
    setSaving(true);
    setMessage(null);
    const { updateMatchVideoUrl } = await import("@/lib/football-supabase");
    const result = await updateMatchVideoUrl(fixtureId, url.trim() || null);
    setSaving(false);
    setMessage(result.ok ? "Guardado" : (result.error ?? "Error al guardar"));
  }, [canEdit, fixtureId, url]);

  if (!isSupabaseConfigured() || !canEdit) return null;

  return (
    <div className={className ?? "mt-4 rounded-2xl border border-dashed border-[#214C9B]/30 bg-slate-50 p-4"}>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Admin — vídeo del partido</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          aria-label="URL del vídeo del partido"
        />
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="rounded-xl bg-[#214C9B] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar vídeo"}
        </button>
      </div>
      {message && <p className="mt-2 text-xs text-slate-600">{message}</p>}
      {user?.email && <p className="mt-1 text-[10px] text-slate-400">Editor: {user.email}</p>}
    </div>
  );
}
