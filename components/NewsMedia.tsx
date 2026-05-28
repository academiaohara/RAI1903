import Image from "next/image";
import { RAI_LOGO_PATH, raiNewsMediaBgClass, shouldUseRaiLogoNewsFallback } from "@/lib/noticias";
import type { NewsItem } from "@/types";

type NewsMediaVariant = "card" | "featured" | "ticker";

const frameByVariant: Record<NewsMediaVariant, string> = {
  card: "aspect-[2/1]",
  featured: "aspect-[2/1] sm:aspect-[21/9]",
  ticker: "aspect-[16/9]",
};

const initialsByVariant: Record<NewsMediaVariant, string> = {
  card: "text-2xl sm:text-3xl",
  featured: "text-3xl sm:text-4xl",
  ticker: "text-2xl",
};

export function NewsMedia({ item, variant = "card" }: { item: NewsItem; variant?: NewsMediaVariant }) {
  const rounded = variant === "ticker" ? "rounded-t-2xl" : variant === "card" || variant === "featured" ? "rounded-none" : "rounded-2xl";
  const frame = `relative w-full shrink-0 overflow-hidden ${raiNewsMediaBgClass(item.teams)} ${rounded} ${frameByVariant[variant]}`;

  if (item.imageUrl) {
    return (
      <div className={frame}>
        <Image
          src={item.imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes={variant === "ticker" ? "320px" : "(max-width: 640px) 100vw, 960px"}
        />
      </div>
    );
  }

  if (shouldUseRaiLogoNewsFallback(item)) {
    const logoSize =
      variant === "featured"
        ? "h-[72%] w-[72%] max-h-32 max-w-32"
        : variant === "ticker"
          ? "h-[64%] w-[64%] max-h-24 max-w-24"
          : "h-[68%] w-[68%] max-h-28 max-w-28";

    return (
      <div className={`flex items-center justify-center ${frame}`}>
        <Image
          src={RAI_LOGO_PATH}
          alt=""
          width={160}
          height={160}
          className={`object-contain ${logoSize}`}
          sizes={variant === "ticker" ? "96px" : variant === "featured" ? "128px" : "112px"}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-[linear-gradient(135deg,#214C9B_0%,#214C9B_48%,#ffffff_48%,#ffffff_56%,#981915_56%,#981915_100%)] font-extrabold text-white shadow-inner ${frame} ${initialsByVariant[variant]}`}
    >
      {item.source.slice(0, 2).toUpperCase()}
    </div>
  );
}
