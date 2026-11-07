import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getPost } from "@/lib/content";
import { getPlace } from "@/data/places";
import { getOgFonts } from "@/lib/og-fonts";
import { getBrandMarkImage } from "@/lib/brand-mark-image";
import { brand, brandColors } from "@/lib/brand.mjs";
import { postImages } from "@/lib/utils";

export const runtime = "nodejs";

async function imageToDataUrl(imagePath: string, origin: string): Promise<string | null> {
  let buffer: Buffer | null = null;

  if (!imagePath.startsWith("http")) {
    const localPath = path.join(process.cwd(), "public", imagePath.replace(/^\//, ""));
    try {
      buffer = await fs.readFile(localPath);
    } catch {
      // Public assets may not be in the function bundle on Vercel; fetch them.
    }
  }

  if (!buffer) {
    try {
      const url = imagePath.startsWith("http") ? imagePath : new URL(imagePath, origin).toString();
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) buffer = Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  }

  if (!buffer) return null;
  const ext = (imagePath.split("?")[0].split(".").pop() || "jpg").toLowerCase();
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function headlineSize(title: string) {
  if (title.length > 115) return 52;
  if (title.length > 90) return 60;
  if (title.length > 65) return 68;
  return 76;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const place = getPlace(post.city);
  const gallery = postImages(post);
  const imageParam = new URL(request.url).searchParams.get("image");
  let selected = gallery[0];
  if (imageParam !== null) {
    const n = Number(imageParam);
    if (!Number.isInteger(n) || n < 1 || n > gallery.length) {
      return new Response("Not found", { status: 404 });
    }
    selected = gallery[n - 1];
  }
  const photoUrl = selected
    ? await imageToDataUrl(selected.socialSrc ?? selected.src, origin)
    : null;
  const logoUrl = await imageToDataUrl("/brand/logo.png", origin);
  const imageCredit = selected?.credit;
  const kicker = place
    ? `${place.name.toUpperCase()} · I-80 ${place.mileMarker}`
    : "I-80 NEBRASKA";
  const title =
    post.title.length > 135 ? `${post.title.slice(0, 132)}…` : post.title;
  const dek = post.dek.length > 180 ? `${post.dek.slice(0, 177)}…` : post.dek;
  const fonts = await getOgFonts();
  const mark = await getBrandMarkImage();

  const png = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: brandColors.highway,
          color: brandColors.paper,
        }}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=""
            width={1080}
            height={1350}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}

        {photoUrl ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              backgroundImage:
                "linear-gradient(to bottom, rgba(10,20,15,0.45) 0%, rgba(10,20,15,0.05) 38%, rgba(10,20,15,0.92) 100%)",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              top: 150,
              left: 0,
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: "Crimson Text",
                fontSize: 560,
                lineHeight: 0.8,
                fontWeight: 700,
                color: "rgba(247,244,236,0.055)",
                display: "flex",
              }}
            >
              80
            </div>
          </div>
        )}

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            padding: "44px 50px 38px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "rgba(20,21,15,0.72)",
                padding: "10px 14px",
                borderRadius: 4,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mark} width={44} height={35} alt="" style={{ width: 44, height: 35 }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "Crimson Text" }}>{brand.name}</div>
                <div style={{ fontSize: 10, letterSpacing: 2.5, color: "#c9d6cc" }}>
                  {brand.descriptor.toUpperCase()}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt=""
                  width={46}
                  height={46}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 9,
                    opacity: 0.84,
                  }}
                />
              ) : null}
              <div
                style={{
                  display: "flex",
                  background: brandColors.amber,
                  color: brandColors.ink,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: 2,
                  padding: "10px 14px",
                }}
              >
                LINK IN BIO
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flex: 1 }} />

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 20,
                letterSpacing: 2,
                color: brandColors.amber,
                fontWeight: 600,
                display: "flex",
                fontFamily: "Crimson Text",
              }}
            >
              {kicker}
            </div>

            <div
              style={{
                marginTop: 14,
                fontSize: headlineSize(title),
                lineHeight: 1.03,
                fontWeight: 700,
                letterSpacing: -0.5,
                color: brandColors.paper,
                display: "flex",
                fontFamily: "Crimson Text",
              }}
            >
              {title}
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 25,
                lineHeight: 1.3,
                color: "#e8e2d3",
                display: "flex",
                fontFamily: "Crimson Text",
                fontWeight: 400,
              }}
            >
              {dek}
            </div>

            {!photoUrl && post.summary.length ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 22,
                  border: "1px solid rgba(247,244,236,0.28)",
                  background: "rgba(247,244,236,0.07)",
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    letterSpacing: 2,
                    color: brandColors.amber,
                    fontWeight: 600,
                    display: "flex",
                    fontFamily: "Crimson Text",
                  }}
                >
                  THE SHORT VERSION
                </div>
                {post.summary.slice(0, 2).map((item) => (
                  <div key={item} style={{ display: "flex", gap: 9, marginTop: 9 }}>
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        background: brandColors.amber,
                        marginTop: 8,
                        flexShrink: 0,
                        display: "flex",
                      }}
                    />
                    <div
                      style={{
                        fontSize: 19,
                        lineHeight: 1.3,
                        color: "#f1ecdf",
                        display: "flex",
                        fontFamily: "Crimson Text",
                      }}
                    >
                      {item.length > 120 ? `${item.slice(0, 117)}…` : item}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                borderTop: "1px solid rgba(247,244,236,0.3)",
                paddingTop: 16,
                marginTop: 22,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 15, letterSpacing: 1, color: brandColors.paper, display: "flex" }}>
                  i80things.com
                </div>
                {imageCredit ? (
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      color: "#b9c9be",
                      maxWidth: 560,
                      display: "flex",
                    }}
                  >
                    {imageCredit.length > 90
                      ? `${imageCredit.slice(0, 87)}…`
                      : imageCredit}
                  </div>
                ) : null}
              </div>
              <div
                style={{
                  background: brandColors.amber,
                  color: brandColors.ink,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 2,
                  padding: "8px 12px",
                  display: "flex",
                }}
              >
                @I80.THINGS
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, fonts },
  );

  try {
    const sharpModule = await import("sharp");
    const sharp = sharpModule.default;
    const buffer = Buffer.from(await png.arrayBuffer());
    const jpeg = await sharp(buffer).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
    return new Response(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Social image conversion failed:", error);
    return new Response("Could not generate the image.", { status: 500 });
  }
}
