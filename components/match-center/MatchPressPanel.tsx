import { EditableMatchVideoBlock } from "@/components/match-center/EditableMatchVideoBlock";
import type { MatchDetail } from "@/types";

export function MatchPressPanel({ detail }: { detail: MatchDetail }) {
  return (
    <EditableMatchVideoBlock
      matchId={detail.match.id}
      field="rdpPostpartido"
      videoLabel="RDP Postpartido"
      fallback={detail.rdpPostpartido}
    />
  );
}
