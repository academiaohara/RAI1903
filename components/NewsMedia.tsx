import Image from "next/image";
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

  return (
    <div
      className={`flex items-center justify-center bg-[linear-gradient(135deg,#214C9B_0%,#214C9B_48%,#ffffff_48%,#ffffff_56%,#981915_56%,#981915_100%)] font-extrabold text-white shadow-inner ${frame} ${initialsByVariant[variant]}`}
    >
      {item.source.slice(0, 2).toUpperCase()}
    </div>
  );
}
