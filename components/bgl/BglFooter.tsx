"use client";

import { cn } from "@/lib/utils";

type BglFooterProps = {
  onSkip?: () => void;
  onCheck: () => void;
  checkDisabled?: boolean;
  checkLabel?: string;
  skipLabel?: string;
  className?: string;
};

export function BglFooter({
  onSkip,
  onCheck,
  checkDisabled = false,
  checkLabel = "Comprobar",
  skipLabel = "Saltar",
  className,
}: BglFooterProps) {
  return (
    <footer className={cn("bgl-footer", className)}>
      {onSkip ? (
        <button type="button" className="bgl-btn bgl-btn--ghost" onClick={onSkip}>
          {skipLabel}
        </button>
      ) : (
        <span />
      )}

      <button
        type="button"
        className="bgl-btn bgl-btn--primary"
        onClick={onCheck}
        disabled={checkDisabled}
      >
        {checkLabel}
      </button>
    </footer>
  );
}
