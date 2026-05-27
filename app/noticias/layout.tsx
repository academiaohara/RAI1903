import { SectionTabs } from "@/components/SectionTabs";
import { NOTICIAS_TABS } from "@/lib/noticias";

export default function NoticiasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <SectionTabs tabs={NOTICIAS_TABS} />
      {children}
    </div>
  );
}
