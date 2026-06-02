"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useMediaRaiSections } from "@/components/media-rai/MediaRaiSectionsProvider";
import { mediaRaiSectionHref } from "@/lib/media-rai-sections";

export function MediaRaiIndexRedirect() {
  const router = useRouter();
  const { sections } = useMediaRaiSections();
  const target = sections[0]?.slug ?? "zona-mixta";

  useEffect(() => {
    router.replace(mediaRaiSectionHref(target) as Route);
  }, [router, target]);

  return null;
}
