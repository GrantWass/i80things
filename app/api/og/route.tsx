import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || "I-80 Things").slice(0, 150);
  const kicker = (searchParams.get("kicker") || "NEBRASKA CORRIDOR NEWS").slice(0, 60);
  const city = (searchParams.get("city") || "").slice(0, 40);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#14432f",
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
            background: "#e3a008",
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
            <div
              style={{
                width: 66,
                height: 60,
                background: "#14432f",
                border: "3px solid #f7f4ec",
                borderRadius: 5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#f7f4ec",
              }}
            >
              <div style={{ fontSize: 8, letterSpacing: 2, fontWeight: 700 }}>INTERSTATE</div>
              <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 0.9 }}>80</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#f7f4ec" }}>I-80 Things</div>
              <div style={{ fontSize: 12, letterSpacing: 3, color: "#b9c9be" }}>
                NEBRASKA CORRIDOR NEWS
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              background: "#e3a008",
              color: "#14150f",
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
              color: "#e3a008",
              fontWeight: 700,
              marginBottom: 14,
              display: "flex",
            }}
          >
            {`${kicker.toUpperCase()}${city ? ` · ${city.toUpperCase()}` : ""}`}
          </div>
          <div
            style={{
              fontSize: title.length > 95 ? 56 : title.length > 70 ? 64 : title.length > 45 ? 72 : 80,
              lineHeight: 1.05,
              fontWeight: 700,
              color: "#f7f4ec",
              letterSpacing: -1.8,
              maxWidth: 1070,
              display: "flex",
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
            <div style={{ width: 8, height: 8, background: "#e3a008", display: "flex" }} />
            <div style={{ fontSize: 17, color: "#f7f4ec", fontWeight: 600, display: "flex" }}>
              i80things.com
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#b9c9be", letterSpacing: 2, display: "flex" }}>
            CRASHES · CLOSURES · WEATHER · CONSTRUCTION
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 675 },
  );
}
