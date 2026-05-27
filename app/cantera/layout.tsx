import { SectionTabs } from "@/components/SectionTabs";
import { academyTeams } from "@/data/mock";

const tabs = academyTeams.map((team) => ({ href: `/cantera/${team.id}`, label: team.name }));

export default function CanteraLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <SectionTabs tabs={tabs} />
      {children}
    </div>
  );
}
