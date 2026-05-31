"use client";

import Image from "next/image";
import { useState } from "react";
import {
  RAI_LOGO_PATH,
  newsImageRequiresUnoptimized,
  raiLogoNewsFallbackEligible,
  raiNewsMediaBgClass,
  shouldUseRaiLogoNewsFallback,
} from "@/lib/noticias";
import type { NewsItem } from "@/types";

type NewsMediaVariant = "card" | "featured" | "ticker";

const frameByVariant: Record<NewsMediaVariant, string> = {
  card: "h-auto min-h-full w-[6.75rem] shrink-0 self-stretch sm:w-[10rem] md:w-[12rem]",
  featured: "h-24 w-[8.75rem] sm:h-28 sm:w-40",
  ticker: "aspect-[16/9] w-full",
};

const initialsByVariant: Record<NewsMediaVariant, string> = {
  card: "text-2xl sm:text-3xl",
  featured: "text-3xl sm:text-4xl",
  ticker: "text-2xl",
};

function RaiLogoNewsMedia({ variant, frame }: { variant: NewsMediaVariant; frame: string }) {
  const logoSize =
    variant === "featured"
      ? "h-[72%] w-[72%] max-h-32 max-w-32"
      : variant === "ticker"
        ? "h-full w-full max-h-48 max-w-48"
        : "h-[68%] w-[68%] max-h-28 max-w-28";

  return (
    <div className={`flex items-center justify-center ${frame}`}>
      <Image
        src={RAI_LOGO_PATH}
        alt=""
        width={160}
        height={160}
        className={`object-contain ${logoSize}`}
        sizes={variant === "ticker" ? "192px" : variant === "featured" ? "128px" : "112px"}
      />
    </div>
  );
}

export function NewsMedia({ item, variant = "card" }: { item: NewsItem; variant?: NewsMediaVariant }) {
  const [imageError, setImageError] = useState(false);
  const rounded =
    variant === "ticker"
      ? "rounded-t-2xl"
      : variant === "card" || variant === "featured"
        ? "rounded-l-xl"
        : "rounded-2xl";
  const widthClass = variant === "ticker" ? "w-full" : "";
  const frame = `relative shrink-0 overflow-hidden ${widthClass} ${raiNewsMediaBgClass(item.teams)} ${rounded} ${frameByVariant[variant]}`;

  const showRemoteImage = Boolean(item.imageUrl) && !imageError;
  const showRaiLogo =
    raiLogoNewsFallbackEligible(item) && (shouldUseRaiLogoNewsFallback(item) || imageError);

  if (showRemoteImage) {
    return (
      <div className={frame}>
        <Image
          src={item.imageUrl!}
          alt=""
          fill
          unoptimized={newsImageRequiresUnoptimized(item.imageUrl!)}
          className="object-cover"
          sizes={
            variant === "ticker"
              ? "320px"
              : variant === "featured"
                ? "160px"
                : variant === "card"
                  ? "(max-width: 640px) 108px, (max-width: 768px) 160px, 192px"
                  : "960px"
          }
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  if (showRaiLogo) {
    return <RaiLogoNewsMedia variant={variant} frame={frame} />;
  }

  return (
    <div
      className={`flex items-center justify-center bg-[linear-gradient(135deg,#214C9B_0%,#214C9B_48%,#ffffff_48%,#ffffff_56%,#981915_56%,#981915_100%)] font-extrabold text-white shadow-inner ${frame} ${initialsByVariant[variant]}`}
    >
      {item.source.slice(0, 2).toUpperCase()}
    </div>
  );
}
