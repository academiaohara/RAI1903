"use client";

import { ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { deleteClubXPostOverrides } from "@/lib/cms/inline-overrides";
import { CLUB_X_HANDLE } from "@/lib/club-x";
import {
  CLUB_X_POST_EMBEDS,
  CLUB_X_POSTS_STORAGE_KEY,
  isClubXPostsList,
  moveClubXPost,
  normalizeClubXPostEmbed,
  sortClubXPostsByDate,
  type ClubXPostEmbed,
} from "@/lib/club-x-posts";
import { loadXWidgets, waitForXWidgetEmbeds } from "@/lib/x-widgets";
import { cn } from "@/lib/utils";

const fieldClassName =
  "w-full rounded-lg border border-[#214C9B]/25 px-2 py-1.5 text-sm outline-none focus:border-[#214C9B]";

function ClubXPostsEmbedList({ posts }: { posts: ClubXPostEmbed[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetsReady, setWidgetsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let stopWaiting: (() => void) | undefined;

    loadXWidgets(() => {
      if (cancelled || !containerRef.current) return;

      window.twttr?.widgets.load(containerRef.current);
      stopWaiting = waitForXWidgetEmbeds(containerRef.current, posts.length, () => {
        if (!cancelled) {
          setWidgetsReady(true);
        }
      });
    });

    return () => {
      cancelled = true;
      stopWaiting?.();
    };
  }, [posts]);

  return (
    <div className="relative max-h-[min(70vh,640px)] min-h-[12rem] w-full max-w-full overflow-y-auto overscroll-y-contain pr-1">
      {!widgetsReady && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white px-4"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Loader2 size={16} className="animate-spin" aria-hidden />
            Cargando tweets…
          </p>
          <div
            className="mx-auto w-full max-w-[550px] animate-pulse space-y-3 rounded-2xl border border-[#214C9B]/10 bg-slate-50 p-4"
            aria-hidden
          >
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-5/6 rounded bg-slate-200" />
            <div className="mt-4 h-3 w-1/3 rounded bg-slate-200" />
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className={cn("flex flex-col items-center gap-4", !widgetsReady && "opacity-0")}
        aria-hidden={!widgetsReady}
      >
        {posts.map((post) => (
          <blockquote
            key={post.id}
            className="twitter-tweet mx-auto w-full max-w-[550px]"
            data-dnt="true"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        ))}
      </div>
    </div>
  );
}

export function ClubXPosts() {
  const { editMode, getValue, saveValue, clearValue, overrides } = useInlineEditing();
  const [draftEmbed, setDraftEmbed] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);

  const hasCustomList = overrides[CLUB_X_POSTS_STORAGE_KEY] !== undefined;
  const currentPosts = sortClubXPostsByDate(
    getValue<ClubXPostEmbed[]>(CLUB_X_POSTS_STORAGE_KEY, CLUB_X_POST_EMBEDS),
  );
  const postsRenderKey = currentPosts.map((post) => post.id).join(",");

  const updatePosts = (next: ClubXPostEmbed[]) => {
    saveValue(CLUB_X_POSTS_STORAGE_KEY, next);
  };

  const restoreDefaultPosts = useCallback(() => {
    clearValue(CLUB_X_POSTS_STORAGE_KEY);
    void deleteClubXPostOverrides();
  }, [clearValue]);

  const addPost = () => {
    const parsed = normalizeClubXPostEmbed(draftEmbed);
    if (!parsed) {
      setParseError("Pega el código de incrustación de publish.x.com (blockquote o HTML interior).");
      return;
    }

    if (currentPosts.some((post) => post.id === parsed.id)) {
      setParseError("Este tweet ya está en la lista.");
      return;
    }

    updatePosts([parsed, ...currentPosts]);
    setDraftEmbed("");
    setParseError(null);
  };

  const removePost = (id: string) => {
    updatePosts(currentPosts.filter((post) => post.id !== id));
  };

  const movePost = (id: string, direction: "up" | "down") => {
    updatePosts(moveClubXPost(currentPosts, id, direction));
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      {editMode && (
        <div className="mb-4 space-y-3 rounded-2xl border border-dashed border-[#214C9B]/35 bg-blue-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase text-slate-600">Modo edición de tweets</p>
            <div className="flex flex-wrap gap-2">
              {hasCustomList && (
                <button
                  type="button"
                  onClick={restoreDefaultPosts}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-extrabold uppercase text-slate-600 hover:bg-slate-50"
                >
                  Restaurar lista por defecto
                </button>
              )}
            </div>
          </div>

          <label className="grid gap-1.5 text-xs font-bold uppercase text-slate-500">
            Código de incrustación
            <textarea
              value={draftEmbed}
              onChange={(event) => {
                setDraftEmbed(event.target.value);
                setParseError(null);
              }}
              rows={5}
              placeholder={'Pega aquí el blockquote de publish.x.com…'}
              aria-label="Código de incrustación de X"
              className={`${fieldClassName} min-h-[7rem] resize-y font-mono text-xs`}
            />
          </label>

          {parseError && <p className="text-xs font-semibold text-[#981915]">{parseError}</p>}

          <button
            type="button"
            onClick={addPost}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#214C9B]/25 bg-white px-3 py-1.5 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
          >
            <Plus size={14} aria-hidden />
            Añadir tweet
          </button>

          {currentPosts.length > 0 && (
            <ol className="space-y-2 border-t border-[#214C9B]/10 pt-3">
              {currentPosts.map((post, index) => (
                <li
                  key={post.id}
                  className="flex items-center gap-2 rounded-xl border border-[#214C9B]/15 bg-white px-3 py-2"
                >
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-600">
                    Tweet {post.id}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => movePost(post.id, "up")}
                      className="rounded-lg border border-[#214C9B]/20 p-1 text-[#214C9B] enabled:hover:bg-blue-50 disabled:opacity-30"
                      aria-label="Subir tweet"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === currentPosts.length - 1}
                      onClick={() => movePost(post.id, "down")}
                      className="rounded-lg border border-[#214C9B]/20 p-1 text-[#214C9B] enabled:hover:bg-blue-50 disabled:opacity-30"
                      aria-label="Bajar tweet"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePost(post.id)}
                      className="rounded-lg border border-rose-200 p-1 text-rose-600 hover:bg-rose-50"
                      aria-label="Eliminar tweet"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {currentPosts.length === 0 && !editMode ? (
        <p className="text-sm font-semibold text-slate-500">No hay tweets publicados todavía.</p>
      ) : currentPosts.length > 0 ? (
        <ClubXPostsEmbedList key={postsRenderKey} posts={currentPosts} />
      ) : null}

      <p className="mt-2.5 border-t border-[#214C9B]/10 pt-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Cuenta oficial · @{CLUB_X_HANDLE}
      </p>
    </div>
  );
}

/** Valida una lista de tweets cargada desde Supabase (uso en servidor o tests). */
export function parseClubXPostsOverride(value: unknown): ClubXPostEmbed[] | null {
  return isClubXPostsList(value) ? value : null;
}
