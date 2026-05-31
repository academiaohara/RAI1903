"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { fetchPublishedNewsItems, newsItemToRow } from "@/lib/cms/news";
import { createClient } from "@/lib/supabase/client";
import type { NewsItem } from "@/types";

type NewsFormState = {
  id: string;
  channel: "club" | "prensa";
  source: string;
  title: string;
  excerpt: string;
  url: string;
  imageUrl: string;
  tags: string;
};

const emptyForm: NewsFormState = {
  id: "",
  channel: "club",
  source: "RAI1903",
  title: "",
  excerpt: "",
  url: "",
  imageUrl: "",
  tags: "club",
};

export default function EditorNewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setItems(await fetchPublishedNewsItems());
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

    const item: NewsItem = {
      id: form.id.trim() || crypto.randomUUID(),
      channel: form.channel,
      source: form.source.trim(),
      date: new Date().toISOString(),
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      url: form.url.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) as NewsItem["tags"],
    };

    const supabase = createClient();
    const row = { ...newsItemToRow(item), updated_at: new Date().toISOString() };
    const { error } = await supabase.from("cms_news_items").upsert(row);

    if (error) {
      setMessage(error.message);
      return;
    }

    setForm(emptyForm);
    setMessage("Noticia publicada.");
    void reload();
  };

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Editor" title="Noticias" description="Enlaces y titulares (club o prensa). Se mezclan con el mock en la web." />

      <Card title="Nueva noticia">
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700">
              ID (opcional)
              <input
                value={form.id}
                onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-[#214C9B]/25 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Canal
              <select
                value={form.channel}
                onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value as "club" | "prensa" }))}
                className="mt-1 w-full rounded-xl border border-[#214C9B]/25 px-3 py-2"
              >
                <option value="club">club</option>
                <option value="prensa">prensa</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-bold text-slate-700">
            Título
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              className="mt-1 w-full rounded-xl border border-[#214C9B]/25 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            Extracto
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-xl border border-[#214C9B]/25 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            URL
            <input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              required
              type="url"
              className="mt-1 w-full rounded-xl border border-[#214C9B]/25 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            Tags (coma)
            <input
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-[#214C9B]/25 px-3 py-2"
            />
          </label>
          <button type="submit" className="rounded-2xl bg-[#214C9B] px-6 py-3 text-sm font-extrabold uppercase text-white">
            Publicar
          </button>
        </form>
        {message ? <p className="mt-3 text-sm font-medium text-[#981915]">{message}</p> : null}
      </Card>

      <Card title={`En feed (${items.length})`}>
        <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
          {items.slice(0, 20).map((item) => (
            <li key={item.id} className="border-b border-slate-100 py-2">
              <span className="font-bold text-[#214C9B]">[{item.channel}]</span> {item.title}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
