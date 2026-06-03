"use client";

import { TitleWithOrnament } from "@/components/TitleWithOrnament";

type AnimatedPageTitleProps = {
  title: string;
  mobileTitle?: string;
  className?: string;
  wrapperClassName?: string;
};

export function AnimatedPageTitle({
  title,
  mobileTitle,
  className,
  wrapperClassName,
}: AnimatedPageTitleProps) {
  return (
    <TitleWithOrnament
      title={title}
      mobileTitle={mobileTitle}
      as="h1"
      animated
      className={className}
      wrapperClassName={wrapperClassName}
    />
  );
}
