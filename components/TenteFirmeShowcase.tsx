"use client";

import { TenteFirmeSpaceCard } from "@/components/TenteFirmeSpaceCard";
import { ZonaMixtaVideoShowcase } from "@/components/ZonaMixtaVideoShowcase";
import type { FanMediaLink, FanYouTubeVideo } from "@/types";

type TenteFirmeShowcaseProps = {
  spaces: FanMediaLink[];
  videos?: FanYouTubeVideo[];
};

export function TenteFirmeShowcase({ spaces, videos = [] }: TenteFirmeShowcaseProps) {
  if (spaces.length === 0 && videos.length === 0) return null;

  return (
    <div className="space-y-10">
      {spaces.length > 0 && (
        <section className="space-y-5 overflow-visible">
          <p className="text-sm font-bold uppercase text-[#214C9B]">X Spaces</p>
          <ul className="grid list-none grid-cols-1 gap-4 overflow-visible p-1 sm:grid-cols-2 lg:grid-cols-4">
            {spaces.map((link) => (
              <li key={link.id} className="min-h-0 overflow-visible">
                <TenteFirmeSpaceCard link={link} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {videos.length > 0 && (
        <section className="space-y-5">
          <p className="text-sm font-bold uppercase text-[#214C9B]">YouTube</p>
          <ZonaMixtaVideoShowcase videos={videos} />
        </section>
      )}
    </div>
  );
}
