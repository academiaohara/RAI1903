declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

/** Script oficial de X Publish para incrustar timelines y posts. */
export const X_WIDGETS_SCRIPT = "https://platform.x.com/widgets.js";
const SCRIPT_ID = "x-widgets";

export function loadXWidgets(onReady: () => void) {
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
  script.src = X_WIDGETS_SCRIPT;
  script.async = true;
  script.charset = "utf-8";
  script.addEventListener("load", onReady);
  document.body.appendChild(script);
}

/** Espera a que los blockquotes de X se conviertan en iframes incrustados. */
export function waitForXWidgetEmbeds(
  container: HTMLElement,
  expectedCount: number,
  onDone: () => void,
  timeoutMs = 15_000,
): () => void {
  if (expectedCount <= 0) {
    onDone();
    return () => {};
  }

  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    observer.disconnect();
    window.clearTimeout(timeoutId);
    onDone();
  };

  const countEmbeds = () => container.querySelectorAll("iframe").length;

  const observer = new MutationObserver(() => {
    if (countEmbeds() >= expectedCount) {
      finish();
    }
  });

  observer.observe(container, { childList: true, subtree: true });

  const timeoutId = window.setTimeout(finish, timeoutMs);

  if (countEmbeds() >= expectedCount) {
    finish();
  }

  return finish;
}
