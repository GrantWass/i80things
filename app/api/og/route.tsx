import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getOgFonts } from "@/lib/og-fonts";
import { getBrandMarkImage } from "@/lib/brand-mark-image";
import { brand, brandColors } from "@/lib/brand.mjs";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || brand.name).slice(0, 150);
  const kicker = (
    searchParams.get("kicker") || brand.descriptor.toUpperCase()
  ).slice(0, 60);
  const city = (searchParams.get("city") || "").slice(0, 40);
  const fonts = await getOgFonts();
  const mark = await getBrandMarkImage();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: brandColors.highway,
          padding: "50px 62px 40px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: brandColors.amber,
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mark} width={66} height={52} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: brandColors.paper, fontFamily: "Crimson Text" }}>{brand.name}</div>
              <div style={{ fontSize: 12, letterSpacing: 3, color: "#b9c9be" }}>
                {brand.descriptor.toUpperCase()}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              background: brandColors.amber,
              color: brandColors.ink,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
              padding: "8px 13px",
            }}
          >
            UPDATED DAILY
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingTop: 16,
            paddingBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 17,
              letterSpacing: 3,
              color: brandColors.amber,
              fontWeight: 600,
              marginBottom: 14,
              display: "flex",
              fontFamily: "Crimson Text",
            }}
          >
            {`${kicker.toUpperCase()}${city ? ` · ${city.toUpperCase()}` : ""}`}
          </div>
          <div
            style={{
              fontSize: title.length > 95 ? 56 : title.length > 70 ? 64 : title.length > 45 ? 72 : 80,
              lineHeight: 1.05,
              fontWeight: 700,
              color: brandColors.paper,
              letterSpacing: -1,
              maxWidth: 1070,
              display: "flex",
              fontFamily: "Crimson Text",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(247,244,236,0.3)",
            paddingTop: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, background: brandColors.amber, display: "flex" }} />
            <div style={{ fontSize: 17, color: brandColors.paper, fontWeight: 600, display: "flex" }}>
              i80things.com
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#b9c9be", letterSpacing: 2, display: "flex" }}>
            CRASHES · CLOSURES · WEATHER · CONSTRUCTION
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 675, fonts },
  );
}
