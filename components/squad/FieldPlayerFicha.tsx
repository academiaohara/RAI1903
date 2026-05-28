"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export type FieldPlayerFichaProps = {
  name: string;
  imageUrl?: string | null;
  flagUrl: string;
  x: number;
  y: number;
  imageAlt?: string;
  flagAlt?: string;
  onClick?: () => void;
  className?: string;
  index?: number;
};

function FichaCard({
  name,
  imageUrl,
  flagUrl,
  imageAlt,
  flagAlt = "",
  className = "",
}: Pick<FieldPlayerFichaProps, "name" | "imageUrl" | "flagUrl" | "imageAlt" | "flagAlt" | "className">) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className={`player-ficha-card overflow-hidden rounded-[10px] border-[3px] border-[#2e67c7] bg-gradient-to-b from-[#eef8ff] to-white shadow-[0_3px_8px_rgba(0,0,0,0.25)] ${className}`}
    >
      <div className="player-ficha-photo flex items-end justify-center bg-[#dff4ff]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? name}
            width={120}
            height={140}
            className="h-full w-[92%] object-cover object-top"
            unoptimized={imageUrl.startsWith("http")}
          />
        ) : (
          <span
            className="flex h-full w-[92%] items-center justify-center pb-5 text-lg font-extrabold text-[#2e67c7]/80"
            aria-hidden
          >
            {initials}
          </span>
        )}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="player-ficha-flag" src={flagUrl} alt={flagAlt} width={18} height={12} loading="lazy" />

      <div className="player-ficha-name">{name}</div>
    </article>
  );
}

/**
 * Small vertical player card for pitch overlays.
 * Position with `x` / `y` as percentages inside a relatively positioned field.
 */
export function FieldPlayerFicha({
  name,
  imageUrl,
  flagUrl,
  x,
  y,
  imageAlt,
  flagAlt,
  onClick,
  className = "",
  index = 0,
}: FieldPlayerFichaProps) {
  const motionProps = {
    className: "player-ficha-slot",
    style: { left: `${x}%`, top: `${y}%` } as const,
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    transition: { delay: index * 0.03, duration: 0.3 },
  };

  if (onClick) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        {...motionProps}
        whileHover={{ scale: 1.06, zIndex: 20 }}
        whileTap={{ scale: 0.98 }}
        className={`${motionProps.className} cursor-pointer border-0 bg-transparent p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
        aria-label={name}
      >
        <FichaCard
          name={name}
          imageUrl={imageUrl}
          flagUrl={flagUrl}
          imageAlt={imageAlt}
          flagAlt={flagAlt}
          className={className}
        />
      </motion.button>
    );
  }

  return (
    <motion.div {...motionProps}>
      <FichaCard
        name={name}
        imageUrl={imageUrl}
        flagUrl={flagUrl}
        imageAlt={imageAlt}
        flagAlt={flagAlt}
        className={className}
      />
    </motion.div>
  );
}
