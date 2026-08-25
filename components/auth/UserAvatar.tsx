import Image from "next/image";
import { cn } from "@/lib/utils";

type UserAvatarSize = "sm" | "md" | "lg";
type UserAvatarFallback = "header" | "card";

type UserAvatarProps = {
  avatarUrl: string | null;
  label?: string;
  size?: UserAvatarSize;
  fallback?: UserAvatarFallback;
  className?: string;
};

const imageSize: Record<UserAvatarSize, string> = {
  sm: "h-8 w-8 sm:h-9 sm:w-9",
  md: "h-9 w-9",
  lg: "h-20 w-20 sm:h-24 sm:w-24",
};

const imagePixels: Record<UserAvatarSize, number> = {
  sm: 36,
  md: 36,
  lg: 96,
};

const fallbackSize: Record<UserAvatarSize, string> = {
  sm: "h-8 w-8 text-xs sm:h-9 sm:w-9 sm:text-sm",
  md: "h-9 w-9 text-xs",
  lg: "h-20 w-20 text-3xl sm:h-24 sm:w-24 sm:text-4xl",
};

const fallbackStyle: Record<UserAvatarFallback, string> = {
  header: "bg-white/20 font-bold uppercase text-white",
  card: "bg-[#214C9B]/10 font-extrabold uppercase text-[#214C9B]",
};

const ringStyle: Record<UserAvatarSize, string> = {
  sm: "border-2 p-0.5",
  md: "border-2 p-0.5",
  lg: "border-[3px] p-1",
};

export function UserAvatar({
  avatarUrl,
  label = "?",
  size = "md",
  fallback = "card",
  className,
}: UserAvatarProps) {
  const initial = label.replace(/^@/, "").charAt(0).toUpperCase() || "?";
  const pixels = imagePixels[size];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border-white/60 transition hover:border-white",
        ringStyle[size],
        className,
      )}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          width={pixels}
          height={pixels}
          className={cn("rounded-full object-cover", imageSize[size])}
          unoptimized
        />
      ) : (
        <span
          className={cn(
            "flex items-center justify-center rounded-full",
            fallbackSize[size],
            fallbackStyle[fallback],
          )}
        >
          {initial}
        </span>
      )}
    </span>
  );
}
