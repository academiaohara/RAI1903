import { MatchVideoBlock } from "@/components/match-center/MatchVideoBlock";
import type { MatchDetail } from "@/types";

export function MatchPressPanel({ detail }: { detail: MatchDetail }) {
  if (!detail.rdpPostpartido) {
    return <p className="text-sm text-slate-500">Sin contenido de post partido.</p>;
  }

  return (
    <div className="space-y-8">
      <MatchVideoBlock video={detail.rdpPostpartido} />
    </div>
  );
}
