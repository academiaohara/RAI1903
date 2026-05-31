import { SectionTabs } from "@/components/SectionTabs";
import { getCronicasTabs } from "@/lib/cronicas";
import { isPrimerEquipoGender, type PrimerEquipoGender } from "@/lib/primer-equipo";
import { notFound } from "next/navigation";

export default async function CronicasLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gender: string }>;
}) {
  const { gender } = await params;
  if (!isPrimerEquipoGender(gender)) notFound();

  return (
    <div className="space-y-6">
      <SectionTabs tabs={getCronicasTabs(gender as PrimerEquipoGender)} />
      {children}
    </div>
  );
}
