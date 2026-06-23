"use client";

import { useEffect, useId, useRef } from "react";
import type { BglConjugateStep } from "@/types/bgl";
import { cn } from "@/lib/utils";

type BglConjugateExerciseProps = {
  step: BglConjugateStep;
  value: string;
  onChange: (value: string) => void;
  feedback?: "correct" | "incorrect" | null;
  disabled?: boolean;
};

export function BglConjugateExercise({
  step,
  value,
  onChange,
  feedback = null,
  disabled = false,
}: BglConjugateExerciseProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [step.id]);

  return (
    <div className="bgl-conjugate-exercise">
      <p className="bgl-conjugate-prompt" aria-hidden>
        {step.prompt}
      </p>

      <div
        className={cn(
          "bgl-sentence-row",
          feedback === "correct" && "bgl-sentence-row--correct",
          feedback === "incorrect" && "bgl-sentence-row--incorrect",
        )}
        role="group"
        aria-labelledby={inputId}
      >
        {step.segments.map((segment, index) => {
          if (segment.type === "fixed") {
            return (
              <span key={`${step.id}-fixed-${index}`} className="bgl-word-chip">
                {segment.text}
              </span>
            );
          }

          return (
            <label key={`${step.id}-verb-${index}`} className="bgl-verb-slot" htmlFor={inputId}>
              <span className="sr-only">Conjuga el verbo «{segment.baseForm}»</span>
              <input
                ref={inputRef}
                id={inputId}
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder={segment.baseForm}
                className="bgl-verb-input"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
