"use client";

import { useEffect, useRef } from "react";
import { CLUB_X_POST_EMBEDS } from "@/lib/club-x-posts";
import { CLUB_X_HANDLE } from "@/lib/club-x";
import { loadXWidgets } from "@/lib/x-widgets";

export function ClubXPosts() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadXWidgets(() => {
      if (containerRef.current) {
        window.twttr?.widgets.load(containerRef.current);
      }
    });
  }, []);

  return (
    <div ref={containerRef} className="space-y-4">
      {CLUB_X_POST_EMBEDS.map((post) => (
        <blockquote
          key={post.id}
          className="twitter-tweet"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      ))}
      <p className="border-t border-[#214C9B]/10 pt-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Cuenta oficial · @{CLUB_X_HANDLE}
      </p>
    </div>
  );
}
