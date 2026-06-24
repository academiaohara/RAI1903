import { teamStripeBackgroundStyle } from "@/lib/team-stripes";
import { cn } from "@/lib/utils";

type TeamColorPairInputProps = {
  colors: [string, string];
  onChange: (colors: [string, string]) => void;
  compact?: boolean;
  className?: string;
  fieldId?: string;
};

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed}`;
  return trimmed;
}

export function TeamColorPairInput({
  colors,
  onChange,
  compact = false,
  className,
  fieldId = "team",
}: TeamColorPairInputProps) {
  const [primary, secondary] = colors;

  return (
    <div className={cn("flex items-center gap-1.5", compact && "gap-1", className)}>
      <div
        className={cn(
          "shrink-0 overflow-hidden rounded-md ring-1 ring-black/10",
          compact ? "h-5 w-5" : "h-7 w-7",
        )}
        style={teamStripeBackgroundStyle(colors)}
        aria-hidden
      />
      <label className="sr-only" htmlFor={`${fieldId}-color-primary`}>
        Color principal
      </label>
      <input
        id={`${fieldId}-color-primary`}
        type="color"
        value={primary}
        onChange={(event) => onChange([event.target.value, secondary])}
        className={cn(
          "cursor-pointer rounded border border-slate-200 bg-white p-0",
          compact ? "h-5 w-5" : "h-7 w-7",
        )}
        title="Color principal"
      />
      <label className="sr-only" htmlFor={`${fieldId}-color-secondary`}>
        Color secundario
      </label>
      <input
        id={`${fieldId}-color-secondary`}
        type="color"
        value={secondary}
        onChange={(event) => onChange([primary, event.target.value])}
        className={cn(
          "cursor-pointer rounded border border-slate-200 bg-white p-0",
          compact ? "h-5 w-5" : "h-7 w-7",
        )}
        title="Color secundario"
      />
      {!compact ? (
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-1">
          <input
            type="text"
            value={primary}
            onChange={(event) => onChange([normalizeHex(event.target.value), secondary])}
            className="min-w-0 rounded-md border border-slate-200 px-1.5 py-1 text-[10px] font-semibold uppercase"
            placeholder="#214C9B"
            spellCheck={false}
          />
          <input
            type="text"
            value={secondary}
            onChange={(event) => onChange([primary, normalizeHex(event.target.value)])}
            className="min-w-0 rounded-md border border-slate-200 px-1.5 py-1 text-[10px] font-semibold uppercase"
            placeholder="#FFFFFF"
            spellCheck={false}
          />
        </div>
      ) : null}
    </div>
  );
}
