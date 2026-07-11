"use client";

import { ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { deleteClubXPostOverrides } from "@/lib/cms/inline-overrides";
import { CLUB_X_HANDLE } from "@/lib/club-x";
import {
  CLUB_X_POSTS_STORAGE_KEY,
  isClubXPostsList,
  moveClubXPost,
  normalizeClubXPostEmbed,
  sortClubXPostsByDate,
  type ClubXPostEmbed,
} from "@/lib/club-x-posts";
import { loadXWidgets } from "@/lib/x-widgets";

const fieldClassName =
  "w-full rounded-lg border border-[#214C9B]/25 px-2 py-1.5 text-sm outline-none focus:border-[#214C9B]";

const WIDGETS_LOADING_MS = 8000;
const TWEETS_BATCH_SIZE = 5;

function isTweetRendered(blockquote: HTMLElement): boolean {
  return (
    blockquote.classList.contains("twitter-tweet-rendered") || blockquote.querySelector("iframe") !== null
  );
}

function TweetEmbedSkeleton() {
  return (
    <div
      className="w-full rounded-2xl border border-[#214C9B]/15 bg-white p-4 shadow-sm"
      role="status"
      aria-label="Cargando tweet"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
        <Loader2 size={14} className="animate-spin text-[#214C9B]" aria-hidden />
        <span className="text-xs font-semibold text-slate-400">Cargando tweet…</span>
      </div>
    </div>
  );
}

function ClubXTweetEmbed({ post }: { post: ClubXPostEmbed }) {
  const blockquoteRef = useRef<HTMLQuoteElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      setIsRendered(true);
    };

    const timeoutId = window.setTimeout(finish, WIDGETS_LOADING_MS);
    let observer: MutationObserver | undefined;

    const watch = (element: HTMLElement) => {
      if (isTweetRendered(element)) {
        finish();
        return;
      }

      observer?.disconnect();
      observer = new MutationObserver(() => {
        if (isTweetRendered(element)) {
          finish();
        }
      });
      observer.observe(element, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    };

    const load = () => {
      const element = blockquoteRef.current;
      if (!element) return;
      window.twttr?.widgets.load(element);
      watch(element);
    };

    loadXWidgets(load);

    const rafId = window.requestAnimationFrame(() => {
      const element = blockquoteRef.current;
      if (!element) return;
      watch(element);
      if (isTweetRendered(element)) {
        finish();
      }
    });

    return () => {
      settled = true;
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [post.id]);

  return (
    <div className="relative mx-auto w-full max-w-[550px]">
      {!isRendered ? <TweetEmbedSkeleton /> : null}
      <blockquote
        ref={blockquoteRef}
        className={cn(
          "twitter-tweet mx-auto w-full max-w-[550px]",
          !isRendered && "pointer-events-none absolute inset-x-0 top-0 h-0 overflow-hidden opacity-0",
        )}
        data-dnt="true"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </div>
  );
}

function ClubXPostsFeed({ posts }: { posts: ClubXPostEmbed[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(TWEETS_BATCH_SIZE);
  const visiblePosts = posts.slice(0, visibleCount);
  const hasMorePosts = visibleCount < posts.length;

  useEffect(() => {
    if (!hasMorePosts) return;

    const sentinel = loadMoreRef.current;
    const scrollRoot = scrollContainerRef.current;
    if (!sentinel || !scrollRoot) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) => Math.min(count + TWEETS_BATCH_SIZE, posts.length));
        }
      },
      { root: scrollRoot, rootMargin: "160px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMorePosts, posts.length, visibleCount]);

  return (
    <div
      ref={scrollContainerRef}
      className="max-h-[min(60vh,520px)] w-full max-w-full overflow-y-auto overscroll-y-contain pr-1"
    >
      <div className="flex flex-col items-center gap-4">
        {visiblePosts.map((post) => (
          <ClubXTweetEmbed key={post.id} post={post} />
        ))}
        {hasMorePosts ? (
          <div
            ref={loadMoreRef}
            className="flex w-full max-w-[550px] items-center justify-center gap-2 py-3 text-xs font-semibold text-slate-400"
            role="status"
            aria-live="polite"
          >
            <Loader2 size={14} className="animate-spin text-[#214C9B]" aria-hidden />
            Cargando más tweets…
          </div>
        ) : null}
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
    getValue<ClubXPostEmbed[]>(CLUB_X_POSTS_STORAGE_KEY, []),
  );
  const postsSignature = currentPosts.map((post) => post.id).join("|");

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
            <ol className="max-h-[min(36vh,220px)] space-y-2 overflow-y-auto overscroll-y-contain border-t border-[#214C9B]/10 pt-3 pr-1">
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
        <ClubXPostsFeed key={postsSignature} posts={currentPosts} />
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
