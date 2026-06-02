"use client";

import { Loader2 } from "lucide-react";
import { useClubAnnouncementUrlMetadata } from "@/hooks/useClubAnnouncementUrlMetadata";
import { looksLikeClubAnnouncementUrl, normalizeClubAnnouncementUrl } from "@/lib/club-announcement";

export type ClubAnnouncementUrlValue = {
  url?: string;
  title?: string;
  excerpt?: string;
  imageUrl?: string;
  date?: string;
};

type ClubAnnouncementUrlFieldProps = {
  value: ClubAnnouncementUrlValue;
  onChange: (value: ClubAnnouncementUrlValue) => void;
  inputClassName?: string;
  labelClassName?: string;
  buttonClassName?: string;
  /** Muestra campos editables de titular, subtítulo e imagen (ficha del jugador). */
  showDetailFields?: boolean;
};

export function ClubAnnouncementUrlField({
  value,
  onChange,
  inputClassName = "mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold",
  labelClassName = "block text-[10px] font-bold uppercase text-slate-500",
  buttonClassName = "inline-flex shrink-0 items-center justify-center gap-1 rounded-lg bg-[#214C9B] px-2.5 py-1.5 text-[10px] font-extrabold uppercase text-white disabled:opacity-50",
  showDetailFields = false,
}: ClubAnnouncementUrlFieldProps) {
  const { fetching, fetchError, fetchMetadata, clearFetchError } = useClubAnnouncementUrlMetadata();

  const url = value.url ?? "";
  const hasPreview = Boolean(value.title?.trim()) && !showDetailFields;

  const patchValue = (patch: Partial<ClubAnnouncementUrlValue>) => {
    onChange({ ...value, ...patch });
  };

  const handleUrlChange = (nextUrl: string) => {
    clearFetchError();
    const trimmed = nextUrl.trim();
    if (!trimmed) {
      onChange({});
      return;
    }
    patchValue({ url: trimmed });
  };

  const handleFetch = async () => {
    const metadata = await fetchMetadata(url);
    if (!metadata) return;

    onChange({
      ...value,
      url: normalizeClubAnnouncementUrl(url),
      title: metadata.title,
      excerpt: metadata.excerpt || undefined,
      imageUrl: metadata.imageUrl,
      date: metadata.date,
    });
  };

  return (
    <div className="space-y-3">
      <label className={labelClassName}>
        Enlace al comunicado (opcional)
        <div className="mt-1 flex flex-col gap-1.5 sm:flex-row">
          <input
            type="url"
            value={url}
            onChange={(event) => handleUrlChange(event.target.value)}
            placeholder="https://realavilesindustrial1903.com/…"
            className={inputClassName}
          />
          <button
            type="button"
            onClick={() => void handleFetch()}
            disabled={fetching || !url.trim()}
            className={buttonClassName}
          >
            {fetching ? <Loader2 size={12} className="animate-spin" aria-hidden /> : null}
            Obtener datos
          </button>
        </div>
      </label>
      {fetchError ? <p className="text-[10px] font-semibold text-[#981915]">{fetchError}</p> : null}

      {showDetailFields ? (
        <>
          <label className={labelClassName}>
            Titular
            <input
              type="text"
              value={value.title ?? ""}
              onChange={(event) => patchValue({ title: event.target.value })}
              placeholder="Titular del comunicado"
              className={inputClassName}
            />
          </label>
          <label className={labelClassName}>
            Subtítulo
            <textarea
              value={value.excerpt ?? ""}
              onChange={(event) => patchValue({ excerpt: event.target.value })}
              placeholder="Extracto o subtítulo"
              rows={3}
              className={`${inputClassName} min-h-[4.5rem] resize-y`}
            />
          </label>
          <label className={labelClassName}>
            Enlace a la imagen
            <input
              type="url"
              value={value.imageUrl ?? ""}
              onChange={(event) => patchValue({ imageUrl: event.target.value })}
              placeholder="https://…/imagen.jpg"
              className={inputClassName}
            />
          </label>
        </>
      ) : null}

      {hasPreview ? (
        <div className="rounded-lg border border-[#214C9B]/20 bg-[#214C9B]/5 px-2.5 py-2">
          <p className="text-[10px] font-extrabold uppercase leading-snug text-[#214C9B]">{value.title}</p>
          {value.excerpt ? (
            <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-700">{value.excerpt}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Convierte el valor del campo a campos del movimiento CMS. */
export function clubAnnouncementFieldsFromUrlValue(
  value: ClubAnnouncementUrlValue,
): Pick<
  import("@/lib/cms/season-bundles").CmsTransferEntry,
  | "clubAnnouncement"
  | "clubAnnouncementTitle"
  | "clubAnnouncementExcerpt"
  | "clubAnnouncementImageUrl"
  | "clubAnnouncementDate"
> {
  const url = value.url?.trim();
  if (!url) {
    return {
      clubAnnouncement: undefined,
      clubAnnouncementTitle: undefined,
      clubAnnouncementExcerpt: undefined,
      clubAnnouncementImageUrl: undefined,
      clubAnnouncementDate: undefined,
    };
  }

  return {
    clubAnnouncement: looksLikeClubAnnouncementUrl(url) ? normalizeClubAnnouncementUrl(url) : url,
    clubAnnouncementTitle: value.title?.trim() || undefined,
    clubAnnouncementExcerpt: value.excerpt?.trim() || undefined,
    clubAnnouncementImageUrl: value.imageUrl?.trim() || undefined,
    clubAnnouncementDate: value.date?.trim() || undefined,
  };
}

export function clubAnnouncementUrlValueFromEntry(entry: {
  clubAnnouncement?: string;
  clubAnnouncementTitle?: string;
  clubAnnouncementExcerpt?: string;
  clubAnnouncementImageUrl?: string;
  clubAnnouncementDate?: string;
}): ClubAnnouncementUrlValue {
  if (!entry.clubAnnouncement?.trim()) return {};
  return {
    url: entry.clubAnnouncement,
    title: entry.clubAnnouncementTitle,
    excerpt: entry.clubAnnouncementExcerpt,
    imageUrl: entry.clubAnnouncementImageUrl,
    date: entry.clubAnnouncementDate,
  };
}
