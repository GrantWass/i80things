import fs from "node:fs/promises";
import path from "node:path";
import { site } from "@/lib/site";

let cache: Promise<string> | null = null;

async function load(): Promise<string> {
  const file = path.join(process.cwd(), "public", "brand", "mark.png");
  try {
    const buffer = await fs.readFile(file);
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    // Public assets may not be in the serverless bundle; fall back to the site.
    const res = await fetch(`${site.url}/brand/mark.png`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error("Brand mark asset unavailable");
    const buffer = Buffer.from(await res.arrayBuffer());
    return `data:image/png;base64,${buffer.toString("base64")}`;
  }
}

/**
 * The generated mark as a data URI. OG and Instagram cards embed this instead
 * of re-typesetting the wordmark, so their badge matches the site exactly.
 */
export function getBrandMarkImage(): Promise<string> {
  cache ??= load();
  return cache;
}
