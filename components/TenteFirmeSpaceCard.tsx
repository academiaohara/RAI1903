import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FanMediaLink } from "@/types";

type TenteFirmeSpaceCardProps = {
  link: FanMediaLink;
  variant?: "featured" | "compact";
};

export function TenteFirmeSpaceCard({ link, variant = "compact" }: TenteFirmeSpaceCardProps) {
  const featured = variant === "featured";

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group flex shrink-0 items-center gap-4 rounded-3xl border border-[#214C9B]/25 bg-white transition hover:-translate-y-0.5 hover:border-[#214C9B]",
        featured ? "w-full p-6 sm:gap-6 sm:p-8" : "w-[min(100%,300px)] snap-start p-5",
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full border-2 border-[#214C9B]/20 bg-slate-100",
          featured ? "h-20 w-20 sm:h-24 sm:w-24" : "h-14 w-14",
        )}
      >
        {link.avatarUrl ? (
          <Image
            src={link.avatarUrl}
            alt=""
            fill
            className="object-cover"
            sizes={featured ? "96px" : "56px"}
            unoptimized={link.avatarUrl.startsWith("http")}
          />
        ) : (
          <span
            className={cn(
              "flex h-full w-full items-center justify-center font-extrabold uppercase text-[#214C9B]",
              featured ? "text-2xl" : "text-lg",
            )}
            aria-hidden
          >
            {link.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            "font-extrabold uppercase leading-snug text-[#214C9B]",
            featured ? "text-xl sm:text-2xl lg:text-3xl" : "text-base",
          )}
        >
          {link.name}
        </h3>
        {link.description && (
          <p
            className={cn(
              "mt-1 line-clamp-2 text-slate-600",
              featured ? "text-sm sm:text-base" : "text-xs",
            )}
          >
            {link.description}
          </p>
        )}
      </div>
      <ExternalLink
        size={featured ? 20 : 16}
        className="shrink-0 text-slate-400 transition group-hover:text-[#214C9B]"
        aria-hidden
      />
    </a>
  );
}
