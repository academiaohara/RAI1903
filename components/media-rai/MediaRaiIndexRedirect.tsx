"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMediaRaiSections } from "@/components/media-rai/MediaRaiSectionsProvider";
import { mediaRaiSectionHref } from "@/lib/media-rai-sections";

export function MediaRaiIndexRedirect() {
  const router = useRouter();
  const { sections } = useMediaRaiSections();
  const target = sections[0]?.slug ?? "zona-mixta";

  useEffect(() => {
    router.replace(mediaRaiSectionHref(target));
  }, [router, target]);

  return null;
}
