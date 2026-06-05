"use client";

import { Clapperboard, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { fanResumenesVideos } from "@/data/mock";
import { useMasculinoLeagueSeason } from "@/hooks/useMasculinoLeagueSeason";
import { collectMediaRaiVideos, sortFanVideosByDate } from "@/lib/fan-videos";
import { youtubeThumbnailUrl, youtubeVideoId } from "@/lib/youtube";
import type { FanYouTubeVideo, MatchVideo } from "@/types";

const MAX_VIDEOS = 6;
const RESUMENES_SECTION = "resumenes";

export type ResolvedResumenVideo = FanYouTubeVideo & { videoId: string };

function resolveVideo(video: FanYouTubeVideo): ResolvedResumenVideo | null {
  const videoId = youtubeVideoId(video.url);
  if (!videoId) return null;
  return { ...video, videoId };
}

function matchVideoToFanVideo(matchId: string, video: MatchVideo): FanYouTubeVideo {
  return {
    id: `match-resumen-${matchId}`,
    title: video.title,
    url: video.url,
  };
}

function collectMatchResumenVideos(
  overrides: Record<string, unknown>,
  matchIds: string[],
): FanYouTubeVideo[] {
  const videos: FanYouTubeVideo[] = [];

  for (const matchId of matchIds) {
    const key = `match:${matchId}:resumenVideo`;
    const value = overrides[key] as MatchVideo | null | undefined;
    if (value?.url?.trim()) {
      videos.push(matchVideoToFanVideo(matchId, value));
    }
  }

  return videos;
}

export function useHomeClubResumenesVideos(): ResolvedResumenVideo[] {
  const { overrides } = useInlineEditing();
  const { latestMatches } = useMasculinoLeagueSeason();

  return useMemo(() => {
    const fromMediaRai = collectMediaRaiVideos(RESUMENES_SECTION, overrides, fanResumenesVideos).videos;
    const fromMatches = collectMatchResumenVideos(
      overrides,
      latestMatches.map((match) => match.id),
    );

    const merged = sortFanVideosByDate([...fromMediaRai, ...fromMatches]);
    const seen = new Set<string>();
    const unique: FanYouTubeVideo[] = [];

    for (const video of merged) {
      const videoId = youtubeVideoId(video.url);
      const dedupeKey = videoId ?? video.id;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      unique.push(video);
      if (unique.length >= MAX_VIDEOS) break;
    }

    return unique.map(resolveVideo).filter((video): video is ResolvedResumenVideo => video !== null);
  }, [latestMatches, overrides]);
}

export function HomeClubResumenesHeader() {
  return (
    <div className="flex min-w-0 w-full items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#981915] sm:text-xs">Media RAI</p>
        <h3 className="mt-0.5 text-base font-extrabold uppercase leading-tight text-[#214C9B] sm:mt-1 sm:text-2xl lg:text-4xl">
          Últimos resúmenes
        </h3>
      </div>
      <Link
        href="/media-rai/resumenes"
        className="inline-flex shrink-0 items-center gap-1 rounded-2xl border border-[#214C9B]/20 px-3 py-1.5 text-[10px] font-extrabold uppercase text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50 sm:py-2 sm:text-xs"
      >
        <Clapperboard size={14} aria-hidden />
        Ver todos
      </Link>
    </div>
  );
}

export function HomeClubResumenesList({ videos }: { videos: ResolvedResumenVideo[] }) {
  if (videos.length === 0) return null;

  return (
    <ul className="min-w-0 w-full space-y-3">
      {videos.map((video) => (
        <li key={video.id}>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full min-w-0 gap-3 overflow-hidden rounded-2xl border border-[#214C9B]/15 bg-white shadow-sm transition hover:border-[#214C9B]/35 hover:shadow-md"
          >
            <div
              className="relative aspect-video w-28 shrink-0 bg-black bg-cover bg-center sm:w-36 md:w-40"
              style={{ backgroundImage: `url(${youtubeThumbnailUrl(video.videoId)})` }}
              role="img"
              aria-label={video.title}
            >
              <span className="absolute inset-0 bg-[#214C9B]/0 transition group-hover:bg-[#214C9B]/10" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center py-2 pr-3">
              {video.date && (
                <time dateTime={video.date} className="text-[10px] font-bold uppercase text-[#981915]">
                  {video.date}
                </time>
              )}
              <p className="line-clamp-2 text-sm font-bold leading-snug text-[#214C9B]">{video.title}</p>
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-slate-400 transition group-hover:text-[#214C9B]">
                Ver vídeo
                <ExternalLink size={10} aria-hidden />
              </span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
