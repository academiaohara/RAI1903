"use client";

import { TitleWithOrnament } from "@/components/TitleWithOrnament";

type AnimatedPageTitleProps = {
  title: string;
  className?: string;
  wrapperClassName?: string;
};

export function AnimatedPageTitle({ title, className, wrapperClassName }: AnimatedPageTitleProps) {
  return (
    <TitleWithOrnament
      title={title}
      as="h1"
      animated
      className={className}
      wrapperClassName={wrapperClassName}
    />
  );
}
