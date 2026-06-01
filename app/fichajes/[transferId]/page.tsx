import { FichajeDetailPageClient } from "@/components/fichajes/FichajeDetailPageClient";

export default async function FichajeDetailPage({ params }: { params: Promise<{ transferId: string }> }) {
  const { transferId } = await params;
  return <FichajeDetailPageClient transferId={transferId} />;
}
