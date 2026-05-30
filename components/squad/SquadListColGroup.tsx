/** Shared column widths so squad list tables align across position sections. */
export function SquadListColGroup({
  variant,
  showAge = true,
  showMarketValue = false,
}: {
  variant: "primer-equipo" | "cantera";
  showAge?: boolean;
  showMarketValue?: boolean;
}) {
  if (variant === "cantera") {
    return (
      <colgroup>
        <col className="w-12" />
        <col className="w-[11.5rem]" />
        <col className="w-[9.5rem]" />
        <col className="w-12" />
        <col className="w-12" />
        <col className="w-12" />
        <col className="w-14" />
        <col className="w-12" />
        <col className="w-12" />
        <col className="w-12" />
      </colgroup>
    );
  }

  return (
    <colgroup>
      <col className="w-12" />
      <col className="w-[11.5rem]" />
      <col className="w-12" />
      {showAge && <col className="w-14" />}
      <col className="w-12" />
      <col className="w-12" />
      <col className="w-12" />
      <col className="w-12" />
      <col className="w-12" />
      {showMarketValue && <col className="w-[4.25rem]" />}
      <col className="w-16" />
    </colgroup>
  );
}
