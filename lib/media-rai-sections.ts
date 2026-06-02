import type { LucideIcon } from "lucide-react";
import {
  Clapperboard,
  Landmark,
  Mic2,
  Radio,
  Ship,
  Target,
  Video,
} from "lucide-react";
import { CONTENIDO_FAN_SLUGS, type ContenidoFanSlug } from "@/lib/contenido-fan-slugs";

export const MEDIA_RAI_SECTIONS_KEY = "media-rai:sections";

export type MediaRaiSectionEntry = {
  slug: string;
  /** Nombre visible en pestañas y menú; si falta, se usa el de la sección por defecto o el slug. */
  label?: string;
};

export const DEFAULT_MEDIA_RAI_SECTIONS: MediaRaiSectionEntry[] = CONTENIDO_FAN_SLUGS.map((slug) => ({
  slug,
}));

const BUILTIN_SLUG_SET = new Set<string>(CONTENIDO_FAN_SLUGS);

const BUILTIN_LABELS: Record<ContenidoFanSlug, string> = {
  "zona-mixta": "Zona Mixta",
  previa: "Previa",
  rdp: "RDP",
  resumenes: "Resúmenes",
  "del-club": "Del club",
  "tente-firme": "Tente firme",
};

const SECTION_ICONS: Record<ContenidoFanSlug, LucideIcon> = {
  "zona-mixta": Radio,
  previa: Target,
  rdp: Mic2,
  resumenes: Clapperboard,
  "del-club": Landmark,
  "tente-firme": Ship,
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isMediaRaiSlug(value: string): boolean {
  return SLUG_PATTERN.test(value) && value.length >= 2 && value.length <= 48;
}

export function slugifyMediaRaiLabel(label: string): string {
  const base = label
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return base && isMediaRaiSlug(base) ? base : "seccion";
}

export function uniqueMediaRaiSlug(label: string, existing: string[]): string {
  const taken = new Set(existing);
  const candidate = slugifyMediaRaiLabel(label);
  if (!taken.has(candidate)) return candidate;

  let index = 2;
  while (taken.has(`${candidate}-${index}`)) index += 1;
  return `${candidate}-${index}`;
}

export function getMediaRaiSectionLabel(entry: MediaRaiSectionEntry): string {
  const trimmed = entry.label?.trim();
  if (trimmed) return trimmed;

  if (BUILTIN_SLUG_SET.has(entry.slug)) {
    return BUILTIN_LABELS[entry.slug as ContenidoFanSlug];
  }

  return entry.slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getMediaRaiSectionIcon(slug: string): LucideIcon {
  if (BUILTIN_SLUG_SET.has(slug)) {
    return SECTION_ICONS[slug as ContenidoFanSlug];
  }
  return Video;
}

/** Garantiza slugs válidos, sin duplicados y al menos una sección. */
export function normalizeMediaRaiSections(raw: unknown): MediaRaiSectionEntry[] {
  if (!Array.isArray(raw)) return [...DEFAULT_MEDIA_RAI_SECTIONS];

  const seen = new Set<string>();
  const ordered: MediaRaiSectionEntry[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const slug = "slug" in item && typeof item.slug === "string" ? item.slug.trim() : "";
    if (!isMediaRaiSlug(slug) || seen.has(slug)) continue;

    const label =
      "label" in item && typeof item.label === "string" && item.label.trim()
        ? item.label.trim()
        : undefined;

    seen.add(slug);
    ordered.push(label ? { slug, label } : { slug });
  }

  return ordered.length > 0 ? ordered : [...DEFAULT_MEDIA_RAI_SECTIONS];
}

export function moveMediaRaiSection(
  sections: MediaRaiSectionEntry[],
  slug: string,
  direction: "up" | "down",
): MediaRaiSectionEntry[] {
  const index = sections.findIndex((entry) => entry.slug === slug);
  if (index < 0) return sections;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= sections.length) return sections;

  const next = [...sections];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function mediaRaiSectionHref(slug: string): string {
  return `/media-rai/${slug}`;
}

export function mediaRaiTabsFromSections(sections: MediaRaiSectionEntry[]) {
  return sections.map((entry) => ({
    href: mediaRaiSectionHref(entry.slug),
    label: getMediaRaiSectionLabel(entry),
  }));
}

export function mediaRaiNavChildrenFromSections(sections: MediaRaiSectionEntry[]) {
  return sections.map((entry) => ({
    href: mediaRaiSectionHref(entry.slug),
    label: getMediaRaiSectionLabel(entry),
    icon: getMediaRaiSectionIcon(entry.slug),
  }));
}

export function isKnownMediaRaiSection(
  slug: string,
  sections: MediaRaiSectionEntry[],
): boolean {
  return sections.some((entry) => entry.slug === slug);
}
