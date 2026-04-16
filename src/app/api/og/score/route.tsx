import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * VelseAI — Dynamic Viral Scorecard Generator
 * 
 * Generates high-fidelity Open Graph images for social sharing.
 * Route: /api/og/score?score=85&name=John%20Doe&role=Software%20Engineer
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const score = searchParams.get("score") || "0";
    const name = searchParams.get("name") || "VelseAI User";
    const role = searchParams.get("role") || "Elite Candidate";

    const scoreInt = parseInt(score);
    const scoreColor = scoreInt > 80 ? "#10b981" : scoreInt > 60 ? "#f59e0b" : "#ef4444";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            backgroundImage: "radial-gradient(circle at 50% 50%, #1e1e2d 0%, #0a0a0a 100%)",
            fontFamily: "sans-serif",
            padding: "40px",
          }}
        >
          {/* Logo */}
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 40,
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#7c3aed",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "900",
                color: "white",
              }}
            >
              V
            </div>
            <span style={{ fontSize: "24px", color: "white", fontWeight: "700", letterSpacing: "-1px" }}>
              VELSEAI
            </span>
          </div>

          {/* Score Badge */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "240px",
              height: "240px",
              borderRadius: "120px",
              border: `8px solid ${scoreColor}44`,
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              marginBottom: "32px",
            }}
          >
            <span style={{ fontSize: "84px", fontWeight: "900", color: scoreColor }}>{score}</span>
            <span style={{ fontSize: "16px", fontWeight: "700", color: "rgba(255, 255, 255, 0.4)", letterSpacing: "4px" }}>
              ATS SCORE
            </span>
          </div>

          {/* User Info */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "42px", fontWeight: "800", color: "white", marginBottom: "8px" }}>
              {name}
            </span>
            <span style={{ fontSize: "20px", fontWeight: "500", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", letterSpacing: "2px" }}>
              {role}
            </span>
          </div>

          {/* Call to Action */}
          <div
            style={{
              position: "absolute",
              bottom: 40,
              display: "flex",
              alignItems: "center",
              padding: "12px 24px",
              backgroundColor: "rgba(124, 58, 237, 0.1)",
              borderRadius: "99px",
              border: "1px solid rgba(124, 58, 237, 0.3)",
            }}
          >
            <span style={{ color: "#a78bfa", fontSize: "14px", fontWeight: "600" }}>
              Tailored @ velseai.com
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
