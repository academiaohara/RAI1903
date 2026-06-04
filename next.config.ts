import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "estaticos-cdn.prensaiberica.es" },
      { protocol: "https", hostname: "s1.ppllstatics.com" },
      { protocol: "https", hostname: "s2.ppllstatics.com" },
      { protocol: "https", hostname: "s3.ppllstatics.com" },
      { protocol: "https", hostname: "www.rtpa.es" },
      { protocol: "https", hostname: "www.realavilesindustrial1903.com" },
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "pbs.twimg.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/primer-equipo", destination: "/primer-equipo/masculino/plantilla", permanent: false },
      { source: "/primer-equipo/plantilla", destination: "/primer-equipo/masculino/plantilla", permanent: false },
      { source: "/primer-equipo/noticias", destination: "/primer-equipo/masculino/noticias", permanent: false },
      { source: "/primer-equipo/competicion", destination: "/primer-equipo/masculino/competicion", permanent: false },
      { source: "/primer-equipo/jornadas", destination: "/primer-equipo/masculino/jornadas", permanent: false },
      { source: "/primer-equipo/cronicas", destination: "/primer-equipo/masculino/plantilla", permanent: false },
      { source: "/primer-equipo/previas", destination: "/primer-equipo/masculino/plantilla", permanent: false },
      { source: "/primer-equipo/masculino/previas", destination: "/primer-equipo/masculino/plantilla", permanent: false },
      { source: "/primer-equipo/masculino/cronicas", destination: "/primer-equipo/masculino/plantilla", permanent: false },
      { source: "/primer-equipo/masculino/cronicas/resumenes", destination: "/primer-equipo/masculino/plantilla", permanent: false },
      { source: "/primer-equipo/femenino/previas", destination: "/primer-equipo/femenino/plantilla", permanent: false },
      { source: "/primer-equipo/femenino/cronicas", destination: "/primer-equipo/femenino/plantilla", permanent: false },
      { source: "/primer-equipo/femenino/cronicas/resumenes", destination: "/primer-equipo/femenino/plantilla", permanent: false },
      { source: "/prensa", destination: "/noticias/club", permanent: false },
      { source: "/prensa/noticias-externas", destination: "/noticias/prensa", permanent: false },
      { source: "/prensa/medios", destination: "/noticias/prensa", permanent: false },
      { source: "/prensa/archivo", destination: "/noticias/prensa", permanent: false },
      { source: "/contenido-fan/youtube", destination: "/media-rai/zona-mixta", permanent: true },
      { source: "/contenido-fan", destination: "/media-rai/zona-mixta", permanent: true },
      { source: "/contenido-fan/:path*", destination: "/media-rai/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
