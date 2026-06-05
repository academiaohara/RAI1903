"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
import { CLUB_X_HANDLE, CLUB_X_PROFILE_URL, CLUB_X_TIMELINE_EMBED_URL } from "@/lib/club-x";

declare global {
  interface Window {
    twttr?: {
      ready: (callback: () => void) => void;
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

const WIDGETS_SCRIPT = "https://platform.twitter.com/widgets.js";

function loadTimelineWidgets(container: HTMLElement | null) {
  if (!container || !window.twttr?.widgets) return;

  const render = () => {
    window.twttr?.widgets.load(container);
  };

  if (window.twttr.ready) {
    window.twttr.ready(render);
  } else {
    render();
  }
}

export function ClubXTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  const mountTimeline = useCallback(() => {
    loadTimelineWidgets(containerRef.current);
  }, []);

  useEffect(() => {
    if (window.twttr?.widgets) {
      mountTimeline();
    }
  }, [mountTimeline]);

  return (
    <>
      <Script
        id="x-widgets"
        src={WIDGETS_SCRIPT}
        strategy="afterInteractive"
        onLoad={mountTimeline}
        onReady={mountTimeline}
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
          href={CLUB_X_TIMELINE_EMBED_URL}
        >
          Publicaciones de @{CLUB_X_HANDLE}
        </a>
        <p className="border-t border-[#214C9B]/10 px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Cuenta oficial · @{CLUB_X_HANDLE}
          {" · "}
          <a
            href={CLUB_X_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#214C9B] hover:underline"
          >
            Abrir en X
          </a>
        </p>
      </div>
    </>
  );
}
