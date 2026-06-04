import Image from "next/image";
import { cn } from "@/lib/utils";

type UserAvatarSize = "sm" | "md";
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
};

const fallbackSize: Record<UserAvatarSize, string> = {
  sm: "h-8 w-8 text-xs sm:h-9 sm:w-9 sm:text-sm",
  md: "h-9 w-9 text-xs",
};

const fallbackStyle: Record<UserAvatarFallback, string> = {
  header: "bg-white/20 font-bold uppercase text-white",
  card: "bg-[#214C9B]/10 font-extrabold uppercase text-[#214C9B]",
};

export function UserAvatar({
  avatarUrl,
  label = "?",
  size = "md",
  fallback = "card",
  className,
}: UserAvatarProps) {
  const initial = label.replace(/^@/, "").charAt(0).toUpperCase() || "?";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border-2 border-white/60 p-0.5 transition hover:border-white",
        className,
      )}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          width={36}
          height={36}
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
