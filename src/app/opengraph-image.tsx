import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

/**
 * Social preview card, generated at build time.
 *
 * Deliberately plain: no custom font is fetched, because next/og needs the font
 * binary at render time and a network fetch here would make the build depend on
 * an external host. The system stack renders reliably and the card is read at
 * thumbnail size anyway.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${profile.name} — ${profile.role}`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#05060a",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#c6ff3d",
          }}
        >
          {profile.role}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 104,
            fontWeight: 700,
            color: "#e8ecf2",
            marginTop: 24,
          }}
        >
          {profile.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#8b97a8",
            marginTop: 28,
            maxWidth: 900,
          }}
        >
          {profile.tagline}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            height: 8,
            width: 220,
            background: "#c6ff3d",
          }}
        />
      </div>
    ),
    size
  );
}
