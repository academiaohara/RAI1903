export function normalizeBglAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isBglAnswerCorrect(value: string, acceptAnswers: string[]): boolean {
  const normalized = normalizeBglAnswer(value);
  if (!normalized) return false;
  return acceptAnswers.some((answer) => normalizeBglAnswer(answer) === normalized);
}
