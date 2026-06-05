"use client";

import { TitleWithOrnament } from "@/components/TitleWithOrnament";

type AnimatedPageTitleProps = {
  title: string;
  mobileTitle?: string;
  size?: "default" | "compact";
  className?: string;
  wrapperClassName?: string;
};

export function AnimatedPageTitle({
  title,
  mobileTitle,
  size,
  className,
  wrapperClassName,
}: AnimatedPageTitleProps) {
  return (
    <TitleWithOrnament
      title={title}
      mobileTitle={mobileTitle}
      as="h1"
      animated
      size={size}
      className={className}
      wrapperClassName={wrapperClassName}
    />
  );
}
