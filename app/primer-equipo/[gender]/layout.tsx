import { notFound } from "next/navigation";
import { PrimerEquipoContextBar } from "@/components/PrimerEquipoContextBar";
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
      <PrimerEquipoContextBar gender={gender as PrimerEquipoGender} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
