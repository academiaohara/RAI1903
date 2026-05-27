import { notFound } from "next/navigation";
import { PrimerEquipoSubnav } from "@/components/PrimerEquipoSubnav";
import { isPrimerEquipoGender, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function PrimerEquipoGenderLayout({
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
      <PrimerEquipoSubnav gender={gender as PrimerEquipoGender} />
      {children}
    </div>
  );
}
