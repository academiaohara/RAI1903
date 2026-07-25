/** Zona horaria de referencia para fechas/horas de partido en la web. */
export const MATCH_CALENDAR_TIMEZONE = "Europe/Madrid";

/** Hora local por defecto al crear partidos sin horario fijado (se muestra sin hora en la UI). */
export const DEFAULT_KICKOFF_LOCAL = "00:00";

/** @deprecated Usar DEFAULT_KICKOFF_LOCAL */
export const DEFAULT_KICKOFF_UTC = DEFAULT_KICKOFF_LOCAL;

type SpainDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function readSpainDateTimeParts(date: Date): SpainDateTimeParts {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: MATCH_CALENDAR_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
  };
}

export function spainDateInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: MATCH_CALENDAR_TIMEZONE }).format(date);
}

export function spainTimeInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || isUnsetKickoff(iso)) return "";
  const parts = readSpainDateTimeParts(date);
  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

export function spainDateParts(iso: string): { day: string; month: string; year: string } {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { day: "", month: "", year: "" };
  const parts = readSpainDateTimeParts(date);
  return {
    day: String(parts.day).padStart(2, "0"),
    month: String(parts.month).padStart(2, "0"),
    year: String(parts.year),
  };
}

export function spainCalendarDayKey(iso: string): string {
  return spainDateInputValue(iso);
}

export function spainTodayKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: MATCH_CALENDAR_TIMEZONE }).format(now);
}

export function spainLocalDateTimeToUtcIso(dateValue: string, timeValue: string): string {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);
  let utcMs = Date.UTC(year, month - 1, day, hours, minutes);

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const current = readSpainDateTimeParts(new Date(utcMs));
    if (
      current.year === year &&
      current.month === month &&
      current.day === day &&
      current.hour === hours &&
      current.minute === minutes
    ) {
      break;
    }

    const desiredMs = Date.UTC(year, month - 1, day, hours, minutes);
    const currentMs = Date.UTC(
      current.year,
      current.month - 1,
      current.day,
      current.hour,
      current.minute,
    );
    utcMs += desiredMs - currentMs;
  }

  return new Date(utcMs).toISOString();
}

export function mergeSpainDateAndTime(iso: string, dateValue: string, timeValue: string): string {
  if (!dateValue) return iso;
  const resolvedTime = timeValue || spainTimeInputValue(iso) || DEFAULT_KICKOFF_LOCAL;
  return spainLocalDateTimeToUtcIso(dateValue, resolvedTime);
}

export function isUnsetKickoff(iso: string): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return true;
  const parts = readSpainDateTimeParts(date);
  return (parts.hour === 0 && parts.minute === 0) || (parts.hour === 12 && parts.minute === 0);
}

/** @deprecated Usar isUnsetKickoff */
export function isUnsetKickoffUtc(iso: string): boolean {
  return isUnsetKickoff(iso);
}

/** Hora local (es-ES) o `null` si el partido no tiene horario fijado. */
export function formatMatchKickoffTime(date: string): string | null {
  if (isUnsetKickoff(date)) return null;
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: MATCH_CALENDAR_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatMatchKickoffDisplay(date: string): string {
  return formatMatchKickoffTime(date) ?? "—";
}

/** HH:mm en hora española para edición; `undefined` si no hay hora fijada. */
export function extractKickoffTimeLocal(iso: string): string | undefined {
  const value = spainTimeInputValue(iso);
  return value || undefined;
}

/** @deprecated Usar extractKickoffTimeLocal */
export function extractKickoffTimeUtc(iso: string): string | undefined {
  return extractKickoffTimeLocal(iso);
}
