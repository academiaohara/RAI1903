/** Canonical site origin for OAuth redirects (server). */
export function getSiteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  // Prefer production domain so OG/Twitter images stay on a public URL (not preview deployments).
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function getAuthCallbackPath(nextPath = "/"): string {
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `/auth/callback?next=${encodeURIComponent(next)}`;
}

const gameTicketPathByKind = {
  quiniela: "/juegos/quiniela/pronosticos",
  quinigol: "/juegos/quinigol/pronosticos",
  clasificacion: "/juegos/clasificacion/pronosticos",
} as const;

export type GameTicketKind = keyof typeof gameTicketPathByKind;

/** Host + path shown on exported game tickets (e.g. rai1903web.vercel.app/juegos/quiniela/pronosticos). */
export function getGameTicketFooterUrl(kind: GameTicketKind): string {
  const path = gameTicketPathByKind[kind];
  if (typeof window !== "undefined") {
    return `${window.location.host}${path}`;
  }
  return `${getSiteOrigin().replace(/^https?:\/\//, "")}${path}`;
}
