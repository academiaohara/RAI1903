import { notFound } from "next/navigation";
import { isPrimerEquipoGender } from "@/lib/primer-equipo";

export default async function PrimerEquipoGenderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gender: string }>;
}) {
  const { gender } = await params;
  if (!isPrimerEquipoGender(gender)) notFound();
  return children;
}
