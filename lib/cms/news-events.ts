export const NEWS_CHANGED_EVENT = "rai1903:news-changed";

export function dispatchNewsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NEWS_CHANGED_EVENT));
}
