import type { BglUnit } from "@/types/bgl";

export const bglUnit1: BglUnit = {
  id: "unit-1",
  title: "Unit 1: Present simple, present continuous & stative verbs",
  description:
    "Practice present simple with third-person subjects, present continuous for actions in progress, and stative verbs that stay in the simple form.",
  steps: [
    {
      id: "unit-1-intro",
      kind: "intro",
      title: "Unit 1: Present simple, present continuous & stative verbs",
      description:
        "Conjugate the verb in each sentence. The other words stay fixed — you only type the correct verb form.",
    },
    {
      id: "jake-walk-school",
      kind: "conjugate",
      instruction: "Write the correct verb form.",
      prompt: "Jake / every morning / walk to school",
      segments: [
        { type: "fixed", text: "Jake" },
        { type: "fixed", text: "every morning" },
        { type: "verb", baseForm: "walk" },
        { type: "fixed", text: "to school" },
      ],
      acceptAnswers: ["walks"],
    },
    {
      id: "they-play-football",
      kind: "conjugate",
      instruction: "Write the correct verb form.",
      prompt: "They / usually / play football",
      segments: [
        { type: "fixed", text: "They" },
        { type: "fixed", text: "usually" },
        { type: "verb", baseForm: "play" },
        { type: "fixed", text: "football" },
      ],
      acceptAnswers: ["play"],
    },
    {
      id: "she-read-now",
      kind: "conjugate",
      instruction: "Write the correct verb form.",
      prompt: "She / right now / read a novel",
      segments: [
        { type: "fixed", text: "She" },
        { type: "fixed", text: "right now" },
        { type: "verb", baseForm: "read" },
        { type: "fixed", text: "a novel" },
      ],
      acceptAnswers: ["is reading", "is reading."],
    },
  ],
};
