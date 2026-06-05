"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { CLUB_X_HANDLE, CLUB_X_PROFILE_URL } from "@/lib/club-x";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

const WIDGETS_SCRIPT = "https://platform.twitter.com/widgets.js";

export function ClubXTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!scriptReady || !containerRef.current) return;
    window.twttr?.widgets.load(containerRef.current);
  }, [scriptReady]);

  return (
    <>
      <Script
        id="x-widgets"
        src={WIDGETS_SCRIPT}
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
      />
      <div
        ref={containerRef}
        className="min-h-[280px] overflow-hidden rounded-2xl border border-[#214C9B]/15 bg-white"
      >
        <a
          className="twitter-timeline"
          data-height="420"
          data-theme="light"
          data-chrome="nofooter"
          data-lang="es"
          data-tweet-limit="6"
          href={CLUB_X_PROFILE_URL}
        >
          Publicaciones de @{CLUB_X_HANDLE}
        </a>
        <p className="border-t border-[#214C9B]/10 px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Cuenta oficial · @{CLUB_X_HANDLE}
        </p>
      </div>
    </>
  );
}
