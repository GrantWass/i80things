import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { getPost } from "@/lib/content";
import { getPlace } from "@/data/places";
import { site } from "@/lib/site";
import { postImagePath } from "@/lib/utils";

export const runtime = "nodejs";

function headlineSize(title: string) {
  if (title.length > 110) return 54;
  if (title.length > 85) return 62;
  if (title.length > 60) return 70;
  return 80;
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

  // Cache the generated image; the underlying post can change, so keep it short.
  const place = getPlace(post.city);
  const imagePath = postImagePath(post);
  const photoUrl = imagePath.startsWith("http")
    ? imagePath
    : `${site.url}${imagePath}`;

  const articleUrl = `${site.url}/news/${post.slug}`;
  const qrCode = await QRCode.toDataURL(articleUrl, {
    margin: 1,
    width: 240,
    color: { dark: "#14432f", light: "#f7f4ec" },
  });

  const png = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f7f4ec",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", height: 360, background: "#14432f", position: "relative" }}>
          {post.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              width={1080}
              height={360}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#f7f4ec",
              }}
            >
              <div style={{ fontSize: 14, letterSpacing: 6 }}>INTERSTATE</div>
              <div style={{ fontSize: 128, fontWeight: 700, lineHeight: 0.9 }}>80</div>
              <div style={{ fontSize: 17, letterSpacing: 5, marginTop: 10 }}>
                NEBRASKA
              </div>
            </div>
          )}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 8,
              background: "#e3a008",
              display: "flex",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "44px 54px 36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div
              style={{
                background: "#14150f",
                color: "#f7f4ec",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 2,
                padding: "7px 13px",
                display: "flex",
              }}
            >
              {place ? place.name.toUpperCase() : "NEBRASKA"}
            </div>
            <div style={{ fontSize: 16, color: "#5d6155", letterSpacing: 1.5, display: "flex" }}>
              I-80 {place ? place.mileMarker : ""}
            </div>
          </div>

          <div
            style={{
              fontSize: headlineSize(post.title),
              lineHeight: 1.04,
              fontWeight: 700,
              letterSpacing: -2,
              color: "#14150f",
              display: "flex",
            }}
          >
            {post.title}
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 25,
              lineHeight: 1.35,
              color: "#5d6155",
              display: "flex",
            }}
          >
            {post.dek.length > 160 ? `${post.dek.slice(0, 157)}…` : post.dek}
          </div>

          {post.summary.length ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 24,
                border: "1px solid #d8d1c0",
                background: "#efe9db",
                padding: "18px 22px",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  letterSpacing: 2.5,
                  color: "#a97400",
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                THE SHORT VERSION
              </div>
              {post.summary.slice(0, 3).map((item) => (
                <div key={item} style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      background: "#e3a008",
                      marginTop: 9,
                      flexShrink: 0,
                      display: "flex",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 20,
                      lineHeight: 1.32,
                      color: "#2b2d24",
                      display: "flex",
                    }}
                  >
                    {item.length > 135 ? `${item.slice(0, 132)}…` : item}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div style={{ display: "flex", flex: 1 }} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              paddingTop: 18,
              paddingBottom: 20,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCode}
              alt=""
              width={126}
              height={126}
              style={{ border: "1px solid #d8d1c0" }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 13,
                  letterSpacing: 2.5,
                  color: "#a97400",
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                SCAN FOR THE FULL STORY
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#14150f",
                  marginTop: 4,
                  display: "flex",
                }}
              >
                Sources, map & updates
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "#5d6155",
                  marginTop: 3,
                  display: "flex",
                }}
              >
                i80things.com
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "2px solid #d8d1c0",
              paddingTop: 20,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#14150f" }}>I-80 Things</div>
              <div style={{ fontSize: 15, letterSpacing: 2, color: "#5d6155" }}>i80things.com</div>
            </div>
            <div
              style={{
                background: "#e3a008",
                color: "#14150f",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 2,
                padding: "10px 14px",
                display: "flex",
              }}
            >
              @I80THINGS
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350 },
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
  } catch {
    // If sharp is unavailable, return the PNG rather than failing the request.
    return png;
  }
}
