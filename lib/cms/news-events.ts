import type { NewsChannel } from "@/types";

export const NEWS_CHANGED_EVENT = "rai1903:news-changed";
export const OPEN_NEWS_ADD_EVENT = "rai1903:open-news-add";

export function dispatchNewsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NEWS_CHANGED_EVENT));
}

export function dispatchOpenNewsAdd(channel?: NewsChannel) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_NEWS_ADD_EVENT, { detail: { channel } }));
}

export function defaultNewsChannelFromPath(pathname: string): NewsChannel {
  if (pathname.startsWith("/noticias/prensa")) return "prensa";
  return "club";
}
