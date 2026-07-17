"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useAppDialog } from "@/components/AppDialogProvider";
import { sourceFromUrl } from "@/lib/news-source";
import type { NewsChannel, NewsItem, NewsTag, PrimerEquipoGender } from "@/types";

const ALL_TAGS: NewsTag[] = [
  "partido",
  "fichajes",
  "cantera",
  "previa",
  "cronica",
  "club",
  "lesionados",
  "rumores",
  "renovaciones",
  "entrevistas",
  "otros",
];

type TeamScope = "general" | PrimerEquipoGender;

function teamScopeFromItem(teams: NewsItem["teams"]): TeamScope {
  if (teams?.length === 1 && (teams[0] === "masculino" || teams[0] === "femenino")) {
    return teams[0];
  }
  return "general";
}

export type NewsEditorFormProps = {
  heading: string;
  newsId: string;
  defaultChannel: NewsChannel;
  initialItem?: NewsItem;
  onSave: (item: NewsItem) => Promise<{ ok: boolean; error?: string }>;
  onDelete?: () => Promise<{ ok: boolean; error?: string }>;
  onCancel: () => void;
  embedded?: boolean;
};

export function NewsEditorForm({
  heading,
  newsId,
  defaultChannel,
  initialItem,
  onSave,
  onDelete,
  onCancel,
  embedded = false,
}: NewsEditorFormProps) {
  const { confirm } = useAppDialog();
  const [url, setUrl] = useState(initialItem?.url ?? "");
  const [title, setTitle] = useState(initialItem?.title ?? "");
  const [excerpt, setExcerpt] = useState(initialItem?.excerpt ?? "");
  const [date, setDate] = useState(initialItem?.date ?? "");
  const [time, setTime] = useState(initialItem?.time ?? "");
  const [imageUrl, setImageUrl] = useState(initialItem?.imageUrl ?? "");
  const [channel, setChannel] = useState<NewsChannel>(initialItem?.channel ?? defaultChannel);
  const [teamScope, setTeamScope] = useState<TeamScope>(teamScopeFromItem(initialItem?.teams));
  const [tags, setTags] = useState<NewsTag[]>(initialItem?.tags ?? []);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchMetadata = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setFetching(true);
    setFetchError(null);
    try {
      const response = await fetch("/api/url-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = (await response.json()) as {
        title?: string | null;
        description?: string | null;
        date?: string | null;
        image?: string | null;
        error?: string;
      };

      if (!response.ok) {
        setFetchError(data.error ?? "No se pudo leer la URL");
        return;
      }

      if (data.title) setTitle(data.title);
      if (data.description) setExcerpt(data.description);
      if (data.date) setDate(data.date);
      if (data.image) setImageUrl(data.image);
    } catch {
      setFetchError("Error de red al obtener la URL");
    } finally {
      setFetching(false);
    }
  };

  const toggleTag = (tag: NewsTag) => {
    setTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]));
  };

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;

    const confirmed = await confirm("¿Eliminar esta noticia? No se puede deshacer.", {
      confirmLabel: "Eliminar",
    });
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    const result = await onDelete();
    setDeleting(false);

    if (!result.ok) {
      setError(result.error ?? "No se pudo eliminar");
    }
  }, [confirm, onDelete]);

  const handleSave = useCallback(async () => {
    const trimmedUrl = url.trim();
    const trimmedTitle = title.trim();
    const trimmedExcerpt = excerpt.trim();
    const trimmedDate = date.trim();

    if (!trimmedUrl || !trimmedTitle || !trimmedDate) {
      setError("URL, título y fecha son obligatorios");
      return;
    }

    const teams: PrimerEquipoGender[] | undefined =
      teamScope === "general" ? undefined : [teamScope];

    const trimmedTime = time.trim();
    const item: NewsItem = {
      id: newsId,
      channel,
      source: sourceFromUrl(trimmedUrl),
      date: trimmedDate,
      time: trimmedTime || undefined,
      title: trimmedTitle,
      excerpt: trimmedExcerpt,
      url: trimmedUrl,
      imageUrl: imageUrl.trim() || undefined,
      tags,
      teams,
      featured: initialItem?.featured,
      playerIds: initialItem?.playerIds,
    };

    setSaving(true);
    setError(null);
    const result = await onSave(item);
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "No se pudo guardar");
    }
  }, [
    channel,
    date,
    time,
    excerpt,
    imageUrl,
    initialItem?.featured,
    initialItem?.playerIds,
    newsId,
    onSave,
    tags,
    teamScope,
    title,
    url,
  ]);

  const chipClass = (active: boolean) =>
    `min-h-10 rounded-full border px-3 py-2 text-xs font-bold uppercase transition active:scale-[0.98] ${
      active ? "border-[#214C9B] bg-[#214C9B] text-white" : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50 active:bg-blue-100"
    }`;

  const fields = (
    <div className={embedded ? "space-y-4" : "mt-4 space-y-4"}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://..."
            className="min-w-0 flex-1 rounded-xl border border-[#214C9B]/25 px-3 py-3 text-base outline-none focus:border-[#214C9B] sm:py-2.5 sm:text-sm"
          />
          <button
            type="button"
            onClick={() => void fetchMetadata()}
            disabled={fetching || !url.trim()}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#214C9B] px-4 py-2.5 text-xs font-extrabold uppercase text-white active:bg-[#0f2d5c] disabled:opacity-50"
          >
            {fetching ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Obtener datos
          </button>
        </div>
        {fetchError ? <p className="text-sm font-medium text-red-600">{fetchError}</p> : null}

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Título"
          className="w-full rounded-xl border border-[#214C9B]/25 px-3 py-3 text-base outline-none focus:border-[#214C9B] sm:py-2.5 sm:text-sm"
        />
        <textarea
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          placeholder="Descripción / extracto"
          rows={3}
          className="w-full rounded-xl border border-[#214C9B]/25 px-3 py-3 text-base outline-none focus:border-[#214C9B] sm:py-2.5 sm:text-sm"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-xs font-bold uppercase text-slate-500">Fecha</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-xl border border-[#214C9B]/25 px-3 py-3 text-base outline-none focus:border-[#214C9B] sm:py-2.5 sm:text-sm"
            />
          </label>
          <label className="flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-[9rem]">
            <span className="text-xs font-bold uppercase text-slate-500">Hora (opcional)</span>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="w-full rounded-xl border border-[#214C9B]/25 px-3 py-3 text-base outline-none focus:border-[#214C9B] sm:py-2.5 sm:text-sm"
            />
          </label>
        </div>
        <input
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="URL de imagen (opcional)"
          className="w-full rounded-xl border border-[#214C9B]/25 px-3 py-3 text-base outline-none focus:border-[#214C9B] sm:py-2.5 sm:text-sm"
        />

        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Canal</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["club", "prensa"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setChannel(value)}
                className={chipClass(channel === value)}
              >
                {value === "club" ? "Club" : "Prensa"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Equipo</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                { id: "general", label: "General" },
                { id: "masculino", label: "Masculino" },
                { id: "femenino", label: "Femenino" },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTeamScope(option.id)}
                className={chipClass(teamScope === option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Etiquetas (pulsa para añadir o quitar)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={chipClass(tags.includes(tag))}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#981915] px-4 py-2.5 text-xs font-extrabold uppercase text-white active:bg-[#7a1410] disabled:opacity-50 sm:flex-none"
          >
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Guardar noticia
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-xl border border-[#214C9B]/25 px-4 py-2.5 text-xs font-extrabold uppercase text-slate-600 hover:bg-slate-50 active:bg-slate-100"
          >
            Cancelar
          </button>
          {onDelete ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={deleting || saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-extrabold uppercase text-red-700 hover:bg-red-50 active:bg-red-100 disabled:opacity-50 sm:ml-auto"
            >
              {deleting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
              Eliminar noticia
            </button>
          ) : null}
        </div>
      </div>
  );

  if (embedded) return fields;

  return (
    <section className="rounded-2xl border border-[#214C9B] bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-sm font-extrabold uppercase text-[#214C9B]">{heading}</h2>
      {fields}
    </section>
  );
}
