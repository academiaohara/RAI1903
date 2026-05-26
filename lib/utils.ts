import type { ResultCode } from "@/types";

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

export const formatDate = (date: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(date));

export const formatMatchDate = (date: string) =>
  new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

export const resultTone = (result: ResultCode) => {
  if (result === "W") return "bg-emerald-400 text-emerald-950";
  if (result === "D") return "bg-amber-300 text-amber-950";
  return "bg-rose-500 text-white";
};

export const matchResultCardTone = (result: ResultCode) => {
  if (result === "W") return "border-emerald-300 bg-emerald-100 hover:border-emerald-500";
  if (result === "D") return "border-amber-300 bg-amber-100 hover:border-amber-500";
  return "border-rose-300 bg-rose-100 hover:border-rose-500";
};

export const pluralize = (count: number, singular: string, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
