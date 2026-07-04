/** Hora UTC por defecto al crear partidos sin horario fijado (se muestra sin hora en la UI). */
export const DEFAULT_KICKOFF_UTC = "00:00";

export function isUnsetKickoffUtc(iso: string): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return true;
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  return (hours === 0 && minutes === 0) || (hours === 12 && minutes === 0);
}

/** Hora local (es-ES) o `null` si el partido no tiene horario fijado. */
export function formatMatchKickoffTime(date: string): string | null {
  if (isUnsetKickoffUtc(date)) return null;
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatMatchKickoffDisplay(date: string): string {
  return formatMatchKickoffTime(date) ?? "—";
}

/** HH:mm en UTC para edición / jornadas; `undefined` si no hay hora fijada. */
export function extractKickoffTimeUtc(iso: string): string | undefined {
  if (isUnsetKickoffUtc(iso)) return undefined;
  const date = new Date(iso);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}
