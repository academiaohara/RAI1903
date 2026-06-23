export type BglSentenceSegment =
  | { type: "fixed"; text: string }
  | { type: "verb"; baseForm: string };

export type BglConjugateStep = {
  id: string;
  kind: "conjugate";
  instruction: string;
  prompt: string;
  segments: BglSentenceSegment[];
  acceptAnswers: string[];
};

export type BglIntroStep = {
  id: string;
  kind: "intro";
  title: string;
  description: string;
};

export type BglStep = BglIntroStep | BglConjugateStep;

export type BglUnit = {
  id: string;
  title: string;
  description: string;
  steps: BglStep[];
};
