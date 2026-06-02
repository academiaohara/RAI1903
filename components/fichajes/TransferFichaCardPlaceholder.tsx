"use client";

type TransferFichaCardPlaceholderProps = {
  layout?: "carousel" | "grid";
};

export function TransferFichaCardPlaceholder({ layout = "carousel" }: TransferFichaCardPlaceholderProps) {
  const wrapperClass =
    layout === "grid" ?
      "w-full max-w-[168px] justify-self-center"
    : "shrink-0 snap-start w-[min(100%,168px)] sm:w-[175px]";

  return (
    <div className={wrapperClass} aria-hidden>
      <article className="overflow-hidden rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-sm rounded-bl-sm border-2 border-dashed border-[#214C9B]/25 bg-slate-50/90">
        <div className="flex h-[132px] items-center justify-center sm:h-[140px]">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Pendiente</span>
        </div>
        <div className="bg-slate-200/90 px-3 py-2">
          <div className="h-4 rounded bg-slate-300/80" />
          <div className="mt-1.5 h-3 w-2/3 rounded bg-slate-300/60" />
        </div>
      </article>
    </div>
  );
}
