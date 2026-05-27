import { cn } from "@/lib/utils";

type OpponentCrestProps = {
  logo: string;
  opponent: string;
  className?: string;
  size?: "md" | "lg";
};

export function OpponentCrest({ logo, opponent, className, size = "lg" }: OpponentCrestProps) {
  const isUrl = logo.startsWith("/") || logo.startsWith("http");

  if (isUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={`Escudo de ${opponent}`}
        className={cn(
          "object-contain drop-shadow-sm",
          size === "lg" ? "h-16 w-16 sm:h-20 sm:w-20" : "h-12 w-12",
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-2xl border-2 border-[#214C9B]/15 bg-gradient-to-br from-slate-50 to-blue-50 font-extrabold text-[#214C9B] shadow-inner",
        size === "lg" ? "h-16 w-16 text-sm sm:h-20 sm:w-20 sm:text-base" : "h-12 w-12 text-xs",
        className,
      )}
      aria-hidden
    >
      {logo}
    </span>
  );
}
