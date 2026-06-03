import { MatchVideoBlock } from "@/components/match-center/MatchVideoBlock";
import type { MatchDetail } from "@/types";

export function MatchResumenPanel({ detail }: { detail: MatchDetail }) {
  if (!detail.resumenVideo) {
    return <p className="text-sm text-slate-500">Sin resumen del partido.</p>;
  }

  return (
    <div className="space-y-8">
      <MatchVideoBlock video={detail.resumenVideo} />
    </div>
  );
}
