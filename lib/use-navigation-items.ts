"use client";

import { useMemo } from "react";
import { useMediaRaiSectionsOptional } from "@/components/media-rai/MediaRaiSectionsProvider";
import { mediaRaiNavChildrenFromSections } from "@/lib/media-rai-sections";
import {
  mobileNavSections,
  navChildrenByHref,
  navItems,
  type MobileNavSection,
  type NavItem,
} from "@/lib/navigation";

function mediaRaiNavChildren(sections: ReturnType<typeof mediaRaiNavChildrenFromSections>) {
  return sections.length > 0 ? sections : navChildrenByHref("/media-rai");
}

/** Navegación principal con subsecciones de Media RAI según el CMS. */
export function useNavigationItems(): NavItem[] {
  const mediaRai = useMediaRaiSectionsOptional();

  return useMemo(() => {
    const children = mediaRaiNavChildren(
      mediaRaiNavChildrenFromSections(mediaRai?.sections ?? []),
    );

    return navItems.map((item) =>
      item.href === "/media-rai" ? { ...item, children } : item,
    );
  }, [mediaRai?.sections]);
}

/** Menú móvil con subsecciones de Media RAI según el CMS. */
export function useMobileNavSections(): MobileNavSection[] {
  const mediaRai = useMediaRaiSectionsOptional();

  return useMemo(() => {
    const children = mediaRaiNavChildren(
      mediaRaiNavChildrenFromSections(mediaRai?.sections ?? []),
    );

    return mobileNavSections.map((section) => {
      if (section.title !== "MEDIA RAI") return section;

      return {
        ...section,
        items: children,
      };
    });
  }, [mediaRai?.sections]);
}
