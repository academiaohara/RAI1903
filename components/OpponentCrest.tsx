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
        className={cn("object-contain", sizeClass, className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center font-extrabold text-[#214C9B]",
        sizeClass,
        className,
      )}
      aria-hidden
    >
      {logo}
    </span>
  );
}
