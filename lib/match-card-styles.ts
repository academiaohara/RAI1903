/** Shared layout for home fixture cards (recent results + upcoming). */
export const matchFixtureCardClassName =
  "flex flex-col overflow-hidden rounded-xl border border-[#214C9B]/25 bg-white shadow-[0_10px_24px_rgba(17,24,39,0.05)] transition hover:border-[#214C9B] sm:rounded-2xl";

/** Ancho fijo en móvil para que todas las tarjetas jersey midan igual. */
export const matchFixtureCardMobileWidthClassName = "mx-auto w-[288px] max-w-full md:mx-0 md:w-full";

/** Franja central de escritorio: mismo ancho en banners y listas (12rem). */
export const matchFixtureDesktopGridClassName =
  "grid grid-cols-[minmax(0,1fr)_12rem_minmax(0,1fr)] items-stretch";

/** Altura mínima uniforme de tarjetas de partido en escritorio. */
export const matchFixtureDesktopCardMinHeightClassName = "md:min-h-[7.5rem]";

/** Crest + score stripe cards (inicio móvil, competición últimos/próximos). */
export const fixtureCrestMatchCardClassName =
  "block overflow-hidden rounded-xl border border-[#214C9B]/20 bg-white transition hover:border-[#214C9B]";
