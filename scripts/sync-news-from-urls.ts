import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchUrlMetadata } from "../lib/url-metadata";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mockPath = join(root, "data/mock.ts");
const mockSource = readFileSync(mockPath, "utf8");

const urlMatches = [...mockSource.matchAll(/url:\s*"([^"]+)"/g)].map((match) => match[1]);
const newsUrls = urlMatches.filter(
  (url) =>
    url.startsWith("http") &&
    !url.includes("youtu.be") &&
    !url.includes("x.com") &&
    !url.includes("example.com") &&
    !url.includes("spotify.com"),
);

const uniqueUrls = [...new Set(newsUrls)];

console.log(`Extrayendo metadatos de ${uniqueUrls.length} URLs...\n`);

for (const url of uniqueUrls) {
  try {
    const metadata = await fetchUrlMetadata(url);
    console.log(JSON.stringify({ url, ...metadata }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ url, error: error instanceof Error ? error.message : String(error) }, null, 2));
  }
}
