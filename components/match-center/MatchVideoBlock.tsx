import { youtubeEmbedUrl, youtubeVideoId } from "@/lib/youtube";
import type { MatchVideo } from "@/types";

export function MatchVideoBlock({ video }: { video: MatchVideo }) {
  const videoId = youtubeVideoId(video.url);
  if (!videoId) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-extrabold uppercase tracking-normal text-[#214C9B]">{video.label}</h3>
      <div className="overflow-hidden rounded-3xl border border-[#214C9B]/25 bg-black shadow-[0_16px_40px_rgba(17,24,39,0.12)]">
        <div className="aspect-video w-full">
          <iframe
            src={`${youtubeEmbedUrl(videoId)}?rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
        <div className="border-t border-white/10 bg-[#0f1f3d] px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#214C9B]">{video.label}</p>
          <p className="mt-1 text-lg font-extrabold uppercase text-white sm:text-xl">{video.title}</p>
        </div>
      </div>
    </div>
  );
}
