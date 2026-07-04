import { formatMatchKickoffDisplay, formatMatchKickoffTime } from "@/lib/match-kickoff-time";
import type { FormCode, ResultCode } from "@/types";

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

export const formatDate = (date: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(date));

/** Fecha de noticia con hora opcional (HH:MM). */
export const formatNewsPublishedLabel = (
  date: string,
  time: string | undefined,
  dateOptions?: Intl.DateTimeFormatOptions,
) => {
  const dateLabel = formatDate(date, dateOptions);
  return time ? `${dateLabel}, ${time}` : dateLabel;
};

export const formatMatchDate = (date: string) =>
  new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

export const formatMatchDay = (date: string) =>
  new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(date));

/** Día de la semana en una letra (D L M X J V S), índice getDay() domingo=0. */
const MATCH_WEEKDAY_LETTER_ES = ["D", "L", "M", "X", "J", "V", "S"] as const;

export const formatMatchWeekdayLetter = (date: string) =>
  MATCH_WEEKDAY_LETTER_ES[new Date(date).getDay()] ?? "";

/** Día de la semana en una letra + fecha numérica: «D, 15/03/2026». */
export const formatMatchWeekdayLetterDate = (date: string) => {
  const numericDate = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
  return `${formatMatchWeekdayLetter(date)}, ${numericDate}`;
};

export const formatMatchTime = (date: string) => formatMatchKickoffDisplay(date);

/** Etiqueta compacta para la pizarra del lineup: «S27-20:00». */
export const formatLineupKickoffLabel = (date: string) => {
  const day = new Date(date).getDate();
  const time = formatMatchKickoffTime(date);
  return time ? `${formatMatchWeekdayLetter(date)}${day}-${time}` : `${formatMatchWeekdayLetter(date)}${day}`;
};

export const resultTone = (result: ResultCode | FormCode) => {
  if (result === "W" || result === "G") return "bg-emerald-500 text-white";
  if (result === "D" || result === "E") return "bg-orange-400 text-orange-950";
  return "bg-rose-500 text-white";
};

export const formatGoalDifference = (value: number) => (value > 0 ? `+${value}` : `${value}`);

export const pluralize = (count: number, singular: string, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
