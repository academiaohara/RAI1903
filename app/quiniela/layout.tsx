import { SectionTabs } from "@/components/SectionTabs";
import { QUINIELA_TABS } from "@/lib/quiniela";

export default function QuinielaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <SectionTabs tabs={[...QUINIELA_TABS]} />
      {children}
    </div>
  );
}
