import { SectionTabs } from "@/components/SectionTabs";
import { getContenidoFanTabs } from "@/lib/contenido-fan";

export default function ContenidoFanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <SectionTabs tabs={getContenidoFanTabs()} />
      {children}
    </div>
  );
}
