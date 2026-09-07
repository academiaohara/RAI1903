import { toPng } from "html-to-image";
import type { GameModeId } from "@/lib/juegos";
import { GAME_MODE_LABELS } from "@/lib/juegos";
import type { RankingListEntry } from "@/lib/ranking-display";

const RANKING_PODIUM_EXPORT_WIDTH = 720;

export type RankingPodiumShareOptions = {
  node: HTMLElement;
  fileName: string;
  shareText: string;
};

async function waitForImages(node: HTMLElement): Promise<void> {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );
}

function waitForLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function waitForFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts?.ready) return;
  try {
    await document.fonts.ready;
  } catch {
    // Ignore font loading failures and continue with capture.
  }
}

function resolvePodiumElement(node: HTMLElement): HTMLElement {
  if (node.classList.contains("ranking-podium")) return node;
  const podium = node.querySelector(".ranking-podium");
  if (podium instanceof HTMLElement) return podium;
  throw new Error("Ranking podium element not found");
}

function prepareCaptureNode(node: HTMLElement): HTMLElement {
  const captureNode = resolvePodiumElement(node).cloneNode(true) as HTMLElement;
  captureNode.querySelectorAll('[data-podium-export-hidden="true"]').forEach((element) => {
    element.remove();
  });
  return captureNode;
}

export async function captureRankingPodium(node: HTMLElement): Promise<Blob> {
  const podiumElement = resolvePodiumElement(node);
  await waitForImages(podiumElement);
  await waitForFonts();
  const captureRoot = document.createElement("div");
  const captureNode = prepareCaptureNode(node);
  captureNode.classList.add("ranking-podium--capture");
  captureRoot.setAttribute("aria-hidden", "true");
  captureRoot.style.position = "fixed";
  captureRoot.style.left = "-10000px";
  captureRoot.style.top = "0";
  captureRoot.style.pointerEvents = "none";
  captureRoot.style.zIndex = "-1";
  captureRoot.appendChild(captureNode);
  document.body.appendChild(captureRoot);
  await waitForImages(captureNode);
  await waitForLayout();

  const exportWidth = Math.max(captureNode.scrollWidth, RANKING_PODIUM_EXPORT_WIDTH);
  captureRoot.style.width = `${exportWidth}px`;
  captureNode.style.width = `${exportWidth}px`;
  captureNode.style.maxWidth = `${exportWidth}px`;

  try {
    const dataUrl = await toPng(captureNode, {
      cacheBust: true,
      pixelRatio: 2,
      width: captureNode.offsetWidth,
      height: captureNode.offsetHeight,
      backgroundColor: "#f0ebe3",
      onImageErrorHandler: () => undefined,
    });
    return await (await fetch(dataUrl)).blob();
  } finally {
    captureRoot.remove();
  }
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function openXIntent(text: string) {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function shareRankingPodium({ node, fileName, shareText }: RankingPodiumShareOptions) {
  const blob = await captureRankingPodium(node);
  const file = new File([blob], fileName, { type: "image/png" });
  const payload = { text: shareText, files: [file] };

  if (
    typeof navigator !== "undefined" &&
    navigator.share &&
    (!navigator.canShare || navigator.canShare(payload))
  ) {
    try {
      await navigator.share(payload);
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  downloadBlob(blob, fileName);
  openXIntent(`${shareText}\n\n(Adjunta la imagen que acabamos de descargar)`);
}

export async function shareRankingPodiumOnX(options: RankingPodiumShareOptions) {
  const blob = await captureRankingPodium(options.node);
  downloadBlob(blob, options.fileName);
  openXIntent(`${options.shareText}\n\n(Adjunta la imagen que acabamos de descargar)`);
}

export async function downloadRankingPodium(
  options: Pick<RankingPodiumShareOptions, "node" | "fileName">,
) {
  downloadBlob(await captureRankingPodium(options.node), options.fileName);
}

const podiumLogoByKind = {
  quiniela: "/juegos/rainielav2.svg",
  quinigol: "/juegos/raigol.svg",
} satisfies Record<"quiniela" | "quinigol", string>;

export function getRankingPodiumLogo(gameKind: "quiniela" | "quinigol"): string {
  return podiumLogoByKind[gameKind];
}

export function buildRankingPodiumContextLabel(
  scope: "round" | "season",
  round: number,
): string {
  return scope === "round" ? `Jornada ${round}` : `Global hasta J${round}`;
}

export function buildRankingPodiumFileName(
  gameKind: "quiniela" | "quinigol",
  scope: "round" | "season",
  round: number,
): string {
  const scopeSlug = scope === "round" ? `j${round}` : `global-j${round}`;
  return `podio-${gameKind}-${scopeSlug}.png`;
}

export function buildRankingPodiumShareText({
  gameKind,
  scope,
  round,
  entries,
  countPoints,
  footerUrl,
}: {
  gameKind: "quiniela" | "quinigol";
  scope: "round" | "season";
  round: number;
  entries: RankingListEntry[];
  countPoints: boolean;
  footerUrl: string;
}): string {
  const gameLabel = GAME_MODE_LABELS[gameKind];
  const contextLabel = buildRankingPodiumContextLabel(scope, round);
  const medals = ["🥇", "🥈", "🥉"];
  const leaders = entries
    .slice(0, 3)
    .map((entry, index) => {
      const handle = entry.handle.startsWith("@") ? entry.handle : `@${entry.handle}`;
      const points = countPoints ? `${entry.points} pts` : "—";
      return `${medals[index]} ${handle} (${points})`;
    })
    .join(" · ");

  return `Podio ${gameLabel} · ${contextLabel}\n${leaders}\n\n${footerUrl}`;
}

export function getRankingPodiumFooterUrl(gameKind: GameModeId): string {
  const path = `/juegos/${gameKind}/ranking`;
  if (typeof window !== "undefined") {
    return `${window.location.host}${path}`;
  }
  return path;
}
