"use client";

import { ExternalLink } from "lucide-react";
import { Card } from "@/components/Card";
import { ClubXPosts } from "@/components/home/ClubXPosts";
import {
  HomeClubResumenesHeader,
  HomeClubResumenesList,
  useHomeClubResumenesVideos,
} from "@/components/home/HomeClubResumenesPanel";
import { CLUB_X_HANDLE, CLUB_X_PROFILE_URL } from "@/lib/club-x";
import { cn } from "@/lib/utils";

const TWO_COLUMN_GRID = "grid gap-4 sm:gap-6 lg:grid-cols-2 lg:items-start lg:gap-8";

export function HomeClubXBlock() {
  const resumenes = useHomeClubResumenesVideos();
  const hasResumenes = resumenes.length > 0;

  return (
    <Card>
      <div className="space-y-4 sm:space-y-6">
        <div
          className={cn(
            "-mx-3 border-b border-[#214C9B]/15 px-3 pb-4 sm:-mx-5 sm:px-5 sm:pb-5",
            hasResumenes && TWO_COLUMN_GRID,
          )}
        >
          <div className="flex min-w-0 w-full flex-row flex-wrap items-center gap-2 sm:items-start sm:justify-between sm:gap-3 md:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#981915] sm:text-xs">Redes</p>
              <h2 className="mt-0.5 text-base font-extrabold uppercase leading-tight text-[#214C9B] sm:mt-1 sm:text-2xl lg:text-4xl">
                Club en X
              </h2>
            </div>
            <a
              href={CLUB_X_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-[#214C9B]/20 px-3 py-2 text-xs font-extrabold uppercase text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
              aria-label={`Abrir @${CLUB_X_HANDLE} en X`}
            >
              @{CLUB_X_HANDLE}
              <ExternalLink size={14} aria-hidden />
            </a>
          </div>

          {hasResumenes ? <HomeClubResumenesHeader /> : null}
        </div>

        <div className={cn(hasResumenes && TWO_COLUMN_GRID)}>
          <div className="min-w-0 w-full">
            <ClubXPosts />
          </div>
          {hasResumenes ? (
            <aside className="min-w-0 w-full">
              <HomeClubResumenesList videos={resumenes} />
            </aside>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
