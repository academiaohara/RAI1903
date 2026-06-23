"use client";

import type { ReactNode } from "react";
import type { SquadPosition, SquadRoleCode } from "@/types/squad";
import { getFichaPositionAbbrev } from "@/lib/ficha-design";
import { cn } from "@/lib/utils";

export type TradingPlayerFichaProps = {
  seasonLabel: string;
  crestUrl: string;
  crestAlt: string;
  nombre: string;
  apellido: string;
  posicion: SquadPosition;
  rol: SquadRoleCode;
  edad: number;
  photo: ReactNode;
  subtitle?: ReactNode;
  topRightBadge?: ReactNode;
  secondaryStat?: string;
  ageLabel?: string;
  className?: string;
};

export function TradingPlayerFicha({
  seasonLabel,
  crestUrl,
  crestAlt,
  nombre,
  apellido,
  posicion,
  rol,
  edad,
  photo,
  subtitle,
  topRightBadge,
  secondaryStat,
  ageLabel,
  className,
}: TradingPlayerFichaProps) {
  const positionAbbrev = getFichaPositionAbbrev(posicion);
  const crestIsUrl = crestUrl.startsWith("/") || crestUrl.startsWith("http");

  return (
    <div className={cn("trading-ficha-shell", className)}>
      <div className="trading-ficha-frame">
        <article className="trading-ficha-card" aria-hidden={false}>
        <div className="trading-ficha-stripes" aria-hidden />

        <div className="absolute left-[6%] top-[4%] z-20 flex flex-col gap-0.5 sm:gap-1">
          <p className="trading-ficha-season">{seasonLabel}</p>
          <span className="trading-ficha-position">{positionAbbrev}</span>
        </div>

        <div className="absolute right-[5%] top-[3.5%] z-20 flex flex-col items-end gap-0.5">
          {crestIsUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={crestUrl} alt={crestAlt} className="trading-ficha-crest" />
          ) : (
            <span className="trading-ficha-crest-fallback" aria-label={crestAlt}>
              {crestUrl}
            </span>
          )}
          {topRightBadge}
        </div>

        <div className="relative z-10 flex h-full min-h-0 items-end justify-center px-[4%] pb-[24%] pt-[18%]">
          {photo}
        </div>

        <div className="trading-ficha-name-plate" aria-hidden>
          <div className="trading-ficha-name-plate-inner">
            <p className="trading-ficha-first-name">{nombre}</p>
            <p className="trading-ficha-last-name">{apellido || nombre}</p>
          </div>
        </div>

        <div className="absolute bottom-[5%] right-[5%] z-20 flex flex-col gap-0.5 sm:gap-1">
          <span className="trading-ficha-stat trading-ficha-stat--light">{ageLabel ?? `${edad}Y`}</span>
          <span className="trading-ficha-stat trading-ficha-stat--dark">{secondaryStat ?? rol}</span>
        </div>
      </article>
      </div>

      {subtitle ? <div className="trading-ficha-subtitle">{subtitle}</div> : null}
    </div>
  );
}
