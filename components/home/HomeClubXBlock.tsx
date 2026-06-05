"use client";

import { ExternalLink } from "lucide-react";
import { Card } from "@/components/Card";
import { ClubXTimeline } from "@/components/home/ClubXTimeline";
import { CLUB_X_HANDLE, CLUB_X_PROFILE_URL } from "@/lib/club-x";

export function HomeClubXBlock() {
  return (
    <Card
      eyebrow="Redes"
      title="Club en X"
      action={
        <a
          href={CLUB_X_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-[#214C9B]/20 px-3 py-2 text-xs font-extrabold uppercase text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
          aria-label={`Abrir @${CLUB_X_HANDLE} en X`}
        >
          @{CLUB_X_HANDLE}
          <ExternalLink size={14} aria-hidden />
        </a>
      }
    >
      <ClubXTimeline />
    </Card>
  );
}
