"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowLeftRight, RefreshCw, UserPlus } from "lucide-react";
import type { ReactNode } from "react";
import type { TransferKind } from "@/types";
import type { SquadPosition, SquadRoleCode } from "@/types/squad";
import { getFichaPositionAbbrev } from "@/lib/ficha-design";
import { getTransferKindLabel } from "@/lib/fichajes";
import { cn } from "@/lib/utils";

export type TradingFichaVariant = "default" | TransferKind;

const KIND_ICON_BY_VARIANT: Record<TransferKind, LucideIcon> = {
  fichaje: UserPlus,
  renovacion: RefreshCw,
  cesion: ArrowLeftRight,
};

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
  variant?: TradingFichaVariant;
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
  variant = "default",
  secondaryStat,
  ageLabel,
  className,
}: TradingPlayerFichaProps) {
  const positionAbbrev = getFichaPositionAbbrev(posicion);
  const crestIsUrl = crestUrl.startsWith("/") || crestUrl.startsWith("http");
  const shellVariantClass = variant === "default" ? null : `trading-ficha-shell--${variant}`;
  const transferKind = variant === "default" ? null : variant;
  const KindIcon = transferKind ? KIND_ICON_BY_VARIANT[transferKind] : null;

  return (
    <div className={cn("trading-ficha-shell", shellVariantClass, className)}>
      <div className="trading-ficha-frame">
        <article
          className={cn("trading-ficha-card", variant !== "default" && `trading-ficha-card--${variant}`)}
          aria-hidden={false}
        >
        <div className="trading-ficha-stripes" aria-hidden />

        <div className="absolute left-[6%] top-[4%] z-20 flex flex-col items-start gap-0.5 sm:gap-1">
          <p className="trading-ficha-season">{seasonLabel}</p>
          <span className="trading-ficha-position trading-ficha-position--role">{positionAbbrev}</span>
        </div>

        <div className="absolute right-[5%] top-[3.5%] z-20">
          {crestIsUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={crestUrl} alt={crestAlt} className="trading-ficha-crest" />
          ) : (
            <span className="trading-ficha-crest-fallback" aria-label={crestAlt}>
              {crestUrl}
            </span>
          )}
        </div>

        <div className="trading-ficha-photo-slot">
          {photo}
        </div>

        <div className="trading-ficha-name-plate" aria-hidden>
          <div className="trading-ficha-name-plate-inner">
            <p className="trading-ficha-first-name">{nombre}</p>
            <p className="trading-ficha-last-name">{apellido || nombre}</p>
          </div>
        </div>

        <div className="absolute bottom-[5%] right-[5%] z-20 flex flex-col items-end gap-0.5 sm:gap-1">
          {KindIcon && transferKind ? (
            <span className="trading-ficha-kind" aria-label={getTransferKindLabel(transferKind)}>
              <KindIcon className="trading-ficha-kind-icon" aria-hidden />
            </span>
          ) : null}
          <span className="trading-ficha-stat trading-ficha-stat--light">{ageLabel ?? `${edad}Y`}</span>
          <span className="trading-ficha-stat trading-ficha-stat--dark">{secondaryStat ?? rol}</span>
        </div>
      </article>
      </div>

      {subtitle ? <div className="trading-ficha-subtitle">{subtitle}</div> : null}
    </div>
  );
}
