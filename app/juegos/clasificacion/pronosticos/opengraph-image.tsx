import { loadClasificacionOgShareData } from "@/lib/clasificacion/og-share-data";
import { OG_IMAGE_SIZE, renderClasificacionOgImage } from "@/lib/clasificacion/render-og-image";

export const alt = "Pronóstico de clasificación del Grupo I — RAI1903";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const data = await loadClasificacionOgShareData();
  return renderClasificacionOgImage(data);
}
