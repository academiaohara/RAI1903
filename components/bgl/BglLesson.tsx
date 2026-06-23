"use client";

import { useMemo, useState } from "react";
import { bglUnit1 } from "@/data/bgl/unit1";
import { isBglAnswerCorrect } from "@/lib/bgl/validate";
import { BglConjugateExercise } from "@/components/bgl/BglConjugateExercise";
import { BglFooter } from "@/components/bgl/BglFooter";
import { BglHeader } from "@/components/bgl/BglHeader";
import { BglStepContent } from "@/components/bgl/BglStepContent";
import type { BglConjugateStep } from "@/types/bgl";

const MAX_HEARTS = 5;

export function BglLesson() {
  const unit = bglUnit1;
  const [stepIndex, setStepIndex] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [checked, setChecked] = useState(false);

  const currentStep = unit.steps[stepIndex];
  const progress = useMemo(() => {
    if (unit.steps.length <= 1) return 100;
    return Math.round((stepIndex / (unit.steps.length - 1)) * 100);
  }, [stepIndex, unit.steps.length]);

  const isConjugateStep = currentStep.kind === "conjugate";
  const conjugateStep = isConjugateStep ? (currentStep as BglConjugateStep) : null;

  const goNext = () => {
    setAnswer("");
    setFeedback(null);
    setChecked(false);
    setStepIndex((index) => Math.min(index + 1, unit.steps.length - 1));
  };

  const handleCheck = () => {
    if (!conjugateStep) {
      goNext();
      return;
    }

    if (!answer.trim()) return;

    const correct = isBglAnswerCorrect(answer, conjugateStep.acceptAnswers);
    setChecked(true);
    setFeedback(correct ? "correct" : "incorrect");

    if (correct) {
      window.setTimeout(goNext, 650);
      return;
    }

    setHearts((current) => Math.max(0, current - 1));
  };

  const handleSkip = () => {
    if (!conjugateStep) return;
    goNext();
  };

  const handleIntroContinue = () => {
    goNext();
  };

  return (
    <div className="bgl-lesson">
      <BglHeader progress={progress} hearts={hearts} maxHearts={MAX_HEARTS} />

      <div className="bgl-lesson-body">
        {currentStep.kind === "intro" ? (
          <BglStepContent title={currentStep.title} description={currentStep.description} />
        ) : (
          <BglStepContent
            title={unit.title}
            description={unit.description}
            instruction={currentStep.instruction}
          >
            <BglConjugateExercise
              step={currentStep}
              value={answer}
              onChange={(nextValue) => {
                setAnswer(nextValue);
                if (checked) {
                  setChecked(false);
                  setFeedback(null);
                }
              }}
              feedback={feedback}
              disabled={checked && feedback === "correct"}
            />
            {feedback === "incorrect" ? (
              <p className="bgl-feedback bgl-feedback--incorrect" role="status">
                No es correcto. Prueba otra forma verbal.
              </p>
            ) : null}
            {feedback === "correct" ? (
              <p className="bgl-feedback bgl-feedback--correct" role="status">
                ¡Correcto!
              </p>
            ) : null}
          </BglStepContent>
        )}
      </div>

      {currentStep.kind === "intro" ? (
        <BglFooter onCheck={handleIntroContinue} checkLabel="Empezar" />
      ) : (
        <BglFooter
          onSkip={stepIndex < unit.steps.length - 1 ? handleSkip : undefined}
          onCheck={handleCheck}
          checkDisabled={!answer.trim()}
          checkLabel={stepIndex === unit.steps.length - 1 ? "Terminar" : "Comprobar"}
        />
      )}
    </div>
  );
}
