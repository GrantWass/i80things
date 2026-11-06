import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { writeRepoFile } from "@/lib/github";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let input: { dataUrl?: string; filename?: string; slug?: string };
  try {
    input = (await request.json()) as typeof input;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!input.dataUrl?.startsWith("data:image/")) {
    return NextResponse.json({ error: "Upload a JPEG, PNG or WebP image." }, { status: 400 });
  }

  const match = input.dataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: "Unsupported image format." }, { status: 400 });
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 8 MB." }, { status: 400 });
  }

  const slug = slugify(input.slug || input.filename || "photo") || "photo";
  const base = slugify((input.filename || "photo").replace(/\.[^.]+$/, "")) || "photo";

  try {
    const sharpModule = await import("sharp");
    const sharp = sharpModule.default;
    const processed = await sharp(buffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer();

    const imagePath = `public/images/posts/${slug}/${Date.now()}-${base}.jpg`;
    await writeRepoFile(
      imagePath,
      processed,
      `image: ${slug}/${base}`,
    );

    return NextResponse.json({
      ok: true,
      path: `/${imagePath.replace(/^public\//, "")}`,
      bytes: processed.byteLength,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not process the image." },
      { status: 500 },
    );
  }
}
