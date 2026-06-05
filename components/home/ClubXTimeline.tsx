"use client";

import { useEffect, useRef } from "react";
import { CLUB_X_HANDLE, CLUB_X_TIMELINE_EMBED_URL } from "@/lib/club-x";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

/** Script oficial de X Publish para incrustar timelines. */
const WIDGETS_SCRIPT = "https://platform.x.com/widgets.js";
const SCRIPT_ID = "x-widgets";

function loadXWidgets(onReady: () => void) {
  if (window.twttr?.widgets) {
    onReady();
    return;
  }

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    existing.addEventListener("load", onReady);
    return;
  }

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = WIDGETS_SCRIPT;
  script.async = true;
  script.charset = "utf-8";
  script.addEventListener("load", onReady);
  document.body.appendChild(script);
}

export function ClubXTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadXWidgets(() => {
      if (containerRef.current) {
        window.twttr?.widgets.load(containerRef.current);
      }
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-[280px] overflow-hidden rounded-2xl border border-[#214C9B]/15 bg-white"
    >
      <a className="twitter-timeline" href={CLUB_X_TIMELINE_EMBED_URL}>
        Posts by {CLUB_X_HANDLE}
      </a>
      <p className="border-t border-[#214C9B]/10 px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Cuenta oficial · @{CLUB_X_HANDLE}
      </p>
    </div>
  );
}
