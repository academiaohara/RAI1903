import { EditableMatchVideoBlock } from "@/components/match-center/EditableMatchVideoBlock";
import type { MatchDetail } from "@/types";

export function MatchResumenPanel({ detail }: { detail: MatchDetail }) {
  return (
    <EditableMatchVideoBlock
      matchId={detail.match.id}
      field="resumenVideo"
      videoLabel="Resumen del partido"
      fallback={detail.resumenVideo}
      emptyMessage="Sin resumen del partido."
    />
  );
}
