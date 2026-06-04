/** Shared layout for home fixture cards (recent results + upcoming). */
export const matchFixtureCardClassName =
  "flex flex-col overflow-hidden rounded-xl border border-[#214C9B]/25 bg-white shadow-[0_10px_24px_rgba(17,24,39,0.05)] transition hover:border-[#214C9B] sm:rounded-2xl md:p-3";

/** Ancho fijo en móvil para que todas las tarjetas jersey midan igual. */
export const matchFixtureCardMobileWidthClassName = "mx-auto w-[288px] max-w-full md:mx-0 md:w-full";

/** Crest + score stripe cards (inicio móvil, competición últimos/próximos). */
export const fixtureCrestMatchCardClassName =
  "block overflow-hidden rounded-xl border border-[#214C9B]/20 bg-white transition hover:border-[#214C9B]";
