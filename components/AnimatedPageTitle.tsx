"use client";

import { TitleWithOrnament } from "@/components/TitleWithOrnament";

type AnimatedPageTitleProps = {
  title: string;
  className?: string;
};

export function AnimatedPageTitle({ title, className }: AnimatedPageTitleProps) {
  return (
    <TitleWithOrnament title={title} as="h1" animated className={className} />
  );
}
