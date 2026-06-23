"use client";

import Link from "next/link";
import { Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";

type BglHeaderProps = {
  progress: number;
  hearts: number;
  maxHearts?: number;
  closeHref?: string;
};

export function BglHeader({ progress, hearts, maxHearts = 5, closeHref = "/" }: BglHeaderProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <header className="bgl-header">
      <Link href={closeHref} className="bgl-close" aria-label="Cerrar lección">
        <X className="size-5" aria-hidden />
      </Link>

      <div className="bgl-progress" aria-hidden>
        <div className="bgl-progress-fill" style={{ width: `${clampedProgress}%` }} />
      </div>

      <div className="bgl-hearts" aria-label={`${hearts} de ${maxHearts} vidas`}>
        {Array.from({ length: maxHearts }, (_, index) => (
          <Heart
            key={index}
            className={cn("bgl-heart", index < hearts ? "bgl-heart--full" : "bgl-heart--empty")}
            aria-hidden
          />
        ))}
      </div>
    </header>
  );
}
