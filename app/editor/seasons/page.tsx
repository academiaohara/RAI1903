"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import type { CmsSeason } from "@/lib/cms/seasons";
import { fetchPublishedSeasons } from "@/lib/cms/seasons";
import { createClient } from "@/lib/supabase/client";

export default function EditorSeasonsPage() {
  const [seasons, setSeasons] = useState<CmsSeason[]>([]);
  const [id, setId] = useState("");
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setSeasons(await fetchPublishedSeasons());
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.from("cms_seasons").upsert({
      id: id.trim(),
      label: label.trim(),
      is_default: false,
      sort_order: seasons.length,
      published: true,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setId("");
    setLabel("");
    setMessage("Temporada guardada.");
    void reload();
  };

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Editor" title="Temporadas" description="IDs como 2025-26, etiqueta visible 25/26." />

      <Card title="Nueva temporada">
        <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-slate-700">
            ID
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="2026-27"
              required
              className="mt-1 w-full rounded-xl border border-[#214C9B]/25 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            Etiqueta
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="26/27"
              required
              className="mt-1 w-full rounded-xl border border-[#214C9B]/25 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="sm:col-span-2 rounded-2xl bg-[#214C9B] px-6 py-3 text-sm font-extrabold uppercase text-white"
          >
            Guardar temporada
          </button>
        </form>
        {message ? <p className="mt-3 text-sm font-medium text-[#981915]">{message}</p> : null}
      </Card>

      <Card title="Publicadas">
        <ul className="space-y-2 text-sm">
          {seasons.map((s) => (
            <li key={s.id} className="flex justify-between border-b border-slate-100 py-2">
              <span className="font-bold text-[#214C9B]">{s.id}</span>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
