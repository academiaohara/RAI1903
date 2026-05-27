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
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <PrimerEquipoSubnav gender={gender as PrimerEquipoGender} />
      <div className="min-w-0 flex-1 space-y-6">{children}</div>
    </div>
  );
}
