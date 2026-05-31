const SOURCE_BY_HOST: Array<{ hosts: string[]; label: string }> = [
  { hosts: ["lne.es"], label: "La Nueva España" },
  { hosts: ["elcomercio.es"], label: "El Comercio" },
  { hosts: ["lavozdegalicia.es"], label: "La Voz de Galicia" },
  { hosts: ["rtpa.es"], label: "RTPA" },
  { hosts: ["realavilesindustrial1903.com"], label: "Real Avilés Industrial" },
  { hosts: ["marca.com"], label: "Marca" },
  { hosts: ["as.com"], label: "AS" },
];

export function sourceFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    for (const entry of SOURCE_BY_HOST) {
      if (entry.hosts.some((h) => host === h || host.endsWith(`.${h}`))) {
        return entry.label;
      }
    }
    const parts = host.split(".");
    const base = parts.length >= 2 ? parts[parts.length - 2]! : host;
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return "Fuente externa";
  }
}
