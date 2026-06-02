"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { SquadPlayer } from "@/types/squad";
import { getPlayerInitials } from "@/lib/squad-utils";

type PlayerAvatarProps = {
  player: SquadPlayer;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  bare?: boolean;
  /** Placeholder initials when the player has no photo. */
  placeholderTone?: "dark" | "light";
  imageClassName?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
};

const sizeMap = {
  sm: "h-10 w-10 text-xs",
  md: "h-14 w-14 text-sm",
  lg: "h-24 w-24 text-2xl",
  xl: "h-40 w-40 text-5xl",
};

export function PlayerAvatar({
  player,
  size = "md",
  className = "",
  bare = false,
  placeholderTone = "dark",
  imageClassName = "object-cover",
  priority = false,
  loading,
}: PlayerAvatarProps) {
  const initials = getPlayerInitials(player);
  const hasCustomSize = className.includes("aspect-") || className.includes("h-") || className.includes("w-full");

  const Wrapper = bare ? "div" : motion.div;
  const wrapperProps = bare ? {} : { whileHover: { scale: 1.03 } };

  return (
    <Wrapper
      {...wrapperProps}
      className={`relative overflow-hidden ${
        bare ? "" : "rounded-2xl bg-gradient-to-br from-[#214C9B] via-[#2a5eb5] to-[#173a78] shadow-lg shadow-blue-950/25"
      } ${hasCustomSize ? "" : sizeMap[size]} ${className}`}
    >
      {player.foto ? (
        <Image
          src={player.foto}
          alt={`${player.nombre} ${player.apellido}`}
          fill
          className={imageClassName}
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 12vw"
          priority={priority}
          loading={loading ?? (priority ? undefined : "lazy")}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center font-extrabold tracking-tight ${
            placeholderTone === "light"
              ? "bg-gradient-to-b from-sky-200/60 to-transparent text-[#214C9B]"
              : "text-white"
          }`}
        >
          <span className="opacity-95">{initials}</span>
          {placeholderTone === "dark" ? (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.35),transparent_45%)]" />
          ) : null}
        </div>
      )}
    </Wrapper>
  );
}
