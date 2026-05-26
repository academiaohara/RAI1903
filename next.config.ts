import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  async redirects() {
    return [
      { source: "/primer-equipo/plantilla", destination: "/primer-equipo/masculino/plantilla", permanent: false },
      { source: "/primer-equipo/noticias", destination: "/primer-equipo/masculino/noticias", permanent: false },
      { source: "/primer-equipo/competicion", destination: "/primer-equipo/masculino/competicion", permanent: false },
    ];
  },
};

export default nextConfig;
