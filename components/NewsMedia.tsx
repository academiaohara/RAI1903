import Image from "next/image";
import { RAI_LOGO_PATH, shouldUseRaiLogoNewsFallback } from "@/lib/noticias";
import type { NewsItem } from "@/types";

type NewsMediaVariant = "card" | "featured" | "ticker";

const frameByVariant: Record<NewsMediaVariant, string> = {
  card: "aspect-[16/9] sm:aspect-auto sm:h-full sm:min-h-[6.75rem]",
  featured: "aspect-[16/9] sm:aspect-auto sm:h-full sm:min-h-[7.5rem]",
  ticker: "aspect-[16/9]",
};

const initialsByVariant: Record<NewsMediaVariant, string> = {
  card: "text-2xl sm:text-3xl",
  featured: "text-3xl sm:text-4xl",
  ticker: "text-2xl",
};

export function NewsMedia({ item, variant = "card" }: { item: NewsItem; variant?: NewsMediaVariant }) {
  const rounded = variant === "ticker" ? "rounded-t-2xl" : "rounded-2xl";
  const frame = `relative w-full shrink-0 overflow-hidden bg-slate-100 ${rounded} ${frameByVariant[variant]}`;

  if (item.imageUrl) {
    return (
      <div className={frame}>
        <Image
          src={item.imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes={
            variant === "ticker"
              ? "320px"
              : variant === "featured"
                ? "(max-width: 640px) 100vw, 176px"
                : "(max-width: 640px) 100vw, 144px"
          }
        />
      </div>
    );
  }

  if (shouldUseRaiLogoNewsFallback(item)) {
    const logoSize =
      variant === "featured" ? "h-[58%] w-[58%] max-h-24 max-w-24" : variant === "ticker" ? "h-[52%] w-[52%] max-h-20 max-w-20" : "h-[54%] w-[54%] max-h-[4.5rem] max-w-[4.5rem]";

    return (
      <div className={`flex items-center justify-center bg-[#214C9B] ${frame}`}>
        <Image
          src={RAI_LOGO_PATH}
          alt=""
          width={120}
          height={120}
          className={`object-contain ${logoSize}`}
          sizes={variant === "ticker" ? "80px" : variant === "featured" ? "96px" : "72px"}
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
