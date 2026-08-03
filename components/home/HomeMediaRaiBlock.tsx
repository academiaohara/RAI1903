"use client";

import { Radio } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import type { Route } from "next";
import { Card } from "@/components/Card";
import { HomeMediaRaiCarousel } from "@/components/home/HomeMediaRaiCarousel";
import { useMediaRaiSections } from "@/components/media-rai/MediaRaiSectionsProvider";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { collectHomeMediaRaiVideos } from "@/lib/home-media-rai";
import { mediaRaiSectionHref } from "@/lib/media-rai-sections";

export function HomeMediaRaiBlock() {
  const { sections } = useMediaRaiSections();
  const { overrides } = useInlineEditing();

  const videos = useMemo(
    () => collectHomeMediaRaiVideos(sections, overrides),
    [overrides, sections],
  );

  if (videos.length === 0) return null;

  const firstSectionHref = mediaRaiSectionHref(sections[0]?.slug ?? "zona-mixta") as Route;

  return (
    <Card
      eyebrow="Media RAI"
      title="Vídeos del club"
      action={
        <Link
          href={firstSectionHref}
          className="inline-flex shrink-0 items-center gap-1 rounded-2xl border border-[#214C9B]/20 px-3 py-1.5 text-[10px] font-extrabold uppercase text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50 sm:py-2 sm:text-xs"
        >
          <Radio size={14} aria-hidden />
          Ver Media RAI
        </Link>
      }
    >
      <HomeMediaRaiCarousel videos={videos} />
    </Card>
  );
}
