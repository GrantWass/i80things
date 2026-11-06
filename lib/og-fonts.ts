import fs from "node:fs/promises";
import path from "node:path";

export type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600 | 700;
  style: "normal";
};

let cache: Promise<OgFont[]> | null = null;

async function loadFonts(): Promise<OgFont[]> {
  const dir = path.join(process.cwd(), "assets", "fonts");
  const files: { file: string; weight: 400 | 600 | 700 }[] = [
    { file: "CrimsonText-Regular.ttf", weight: 400 },
    { file: "CrimsonText-SemiBold.ttf", weight: 600 },
    { file: "CrimsonText-Bold.ttf", weight: 700 },
  ];

  return Promise.all(
    files.map(async ({ file, weight }) => {
      const buffer = await fs.readFile(path.join(dir, file));
      const data = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      ) as ArrayBuffer;
      return {
        name: "Crimson Text",
        data,
        weight,
        style: "normal" as const,
      };
    }),
  );
}

/** Load the editorial serif used by generated OG and Instagram images. */
export function getOgFonts(): Promise<OgFont[]> {
  if (!cache) cache = loadFonts();
  return cache;
}
