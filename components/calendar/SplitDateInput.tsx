"use client";

import { mergeUtcDateAndTime, utcTimeInputValue } from "@/lib/calendar-match-overrides";
import { cn } from "@/lib/utils";
import { useState, type KeyboardEvent } from "react";

type SplitDateInputProps = {
  iso: string;
  onChange: (iso: string) => void;
  /** Hora HH:mm si se guarda aparte del ISO (p. ej. kickoffTime en jornadas). */
  timeValue?: string;
  className?: string;
  fieldClassName?: string;
  labelClassName?: string;
  disabled?: boolean;
};

export function utcDateParts(iso: string): { day: string; month: string; year: string } {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { day: "", month: "", year: "" };
  return {
    day: String(date.getUTCDate()).padStart(2, "0"),
    month: String(date.getUTCMonth() + 1).padStart(2, "0"),
    year: String(date.getUTCFullYear()),
  };
}

function digitsOnly(value: string, maxLen: number): string {
  return value.replace(/\D/g, "").slice(0, maxLen);
}

function pad2(value: string): string {
  const digits = digitsOnly(value, 2);
  if (!digits) return "";
  return digits.padStart(2, "0");
}

function isValidDateParts(day: string, month: string, year: string): boolean {
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return false;
  const dayNum = Number(day);
  const monthNum = Number(month);
  const yearNum = Number(year);
  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 2100) {
    return false;
  }
  const probe = new Date(Date.UTC(yearNum, monthNum - 1, dayNum));
  return (
    probe.getUTCFullYear() === yearNum &&
    probe.getUTCMonth() === monthNum - 1 &&
    probe.getUTCDate() === dayNum
  );
}

export function SplitDateInput({
  iso,
  onChange,
  timeValue: timeValueProp,
  className,
  fieldClassName,
  labelClassName,
  disabled = false,
}: SplitDateInputProps) {
  const synced = utcDateParts(iso);
  const [day, setDay] = useState(synced.day);
  const [month, setMonth] = useState(synced.month);
  const [year, setYear] = useState(synced.year);

  const resolvedTime = () => (timeValueProp ?? utcTimeInputValue(iso)) || "12:00";

  const commit = (nextDay: string, nextMonth: string, nextYear: string) => {
    const normalizedDay = pad2(nextDay);
    const normalizedMonth = pad2(nextMonth);
    const normalizedYear = digitsOnly(nextYear, 4);
    setDay(normalizedDay);
    setMonth(normalizedMonth);
    setYear(normalizedYear);
    if (!isValidDateParts(normalizedDay, normalizedMonth, normalizedYear)) return;
    const dateValue = `${normalizedYear}-${normalizedMonth}-${normalizedDay}`;
    onChange(mergeUtcDateAndTime(iso, dateValue, resolvedTime()));
  };

  const onFieldKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      (event.target as HTMLInputElement).blur();
    }
  };

  const inputClass = cn(
    "w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-xs font-bold tabular-nums text-slate-700 outline-none focus:border-[#214C9B]",
    fieldClassName,
  );

  return (
    <div className={cn("grid grid-cols-3 gap-1.5", className)}>
      <label className="grid gap-0.5">
        <span className={cn("font-extrabold uppercase tracking-wide text-slate-500", labelClassName)}>Día</span>
        <input
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={day}
          disabled={disabled}
          onChange={(event) => setDay(digitsOnly(event.target.value, 2))}
          onBlur={() => commit(day, month, year)}
          onKeyDown={onFieldKeyDown}
          className={inputClass}
          aria-label="Día del partido"
          placeholder="DD"
        />
      </label>
      <label className="grid gap-0.5">
        <span className={cn("font-extrabold uppercase tracking-wide text-slate-500", labelClassName)}>Mes</span>
        <input
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={month}
          disabled={disabled}
          onChange={(event) => setMonth(digitsOnly(event.target.value, 2))}
          onBlur={() => commit(day, month, year)}
          onKeyDown={onFieldKeyDown}
          className={inputClass}
          aria-label="Mes del partido"
          placeholder="MM"
        />
      </label>
      <label className="grid gap-0.5">
        <span className={cn("font-extrabold uppercase tracking-wide text-slate-500", labelClassName)}>Año</span>
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={year}
          disabled={disabled}
          onChange={(event) => setYear(digitsOnly(event.target.value, 4))}
          onBlur={() => commit(day, month, year)}
          onKeyDown={onFieldKeyDown}
          className={inputClass}
          aria-label="Año del partido"
          placeholder="AAAA"
        />
      </label>
    </div>
  );
}
