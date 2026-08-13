import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/auth/site-url";

const title = "Pronóstico de clasificación";
const description =
  "Ordena los 20 equipos del Grupo I según crees que acabará la liga. 20 puntos por acierto exacto. ¿Dónde quedará el Real Avilés?";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title,
  description,
  openGraph: {
    title: `${title} | RAI1903`,
    description,
    type: "website",
    url: "/juegos/clasificacion/pronosticos",
    siteName: "RAI1903",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | RAI1903`,
    description,
  },
};

export default function ClasificacionPronosticosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
