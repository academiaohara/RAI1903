const STORAGE_KEY = "rai1903.games.login-prompt.seen";

export function hasSeenGameLoginPrompt(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function markGameLoginPromptSeen(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, "1");
}
