import { cn } from "@/lib/utils";

type OpponentCrestProps = {
  logo: string;
  opponent: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const crestSizeClass = {
  sm: "h-7 w-7 text-[9px]",
  md: "h-12 w-12 text-xs",
  lg: "h-16 w-16 text-sm sm:h-20 sm:w-20 sm:text-base",
} as const;

export function OpponentCrest({ logo, opponent, className, size = "lg" }: OpponentCrestProps) {
  const isUrl = logo.startsWith("/") || logo.startsWith("http");
  const sizeClass = crestSizeClass[size];

  if (isUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={`Escudo de ${opponent}`}
        className={cn("object-contain drop-shadow-sm", sizeClass, className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-2xl border-2 border-[#214C9B]/15 bg-gradient-to-br from-slate-50 to-blue-50 font-extrabold text-[#214C9B] shadow-inner",
        sizeClass,
        className,
      )}
      aria-hidden
    >
      {logo}
    </span>
  );
}
