import { ImageResponse } from "next/og";

export const alt = "Phoenix Global Holding";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TAGLINE: Record<string, string> = {
  es: "Comercio internacional · Tecnología · Estructuración corporativa",
  pt: "Comércio internacional · Tecnologia · Estruturação corporativa",
  en: "International trade · Technology · Corporate structuring",
};

const FOOTER: Record<string, string> = {
  es: "Paraguay · Alcance global",
  pt: "Paraguai · Alcance global",
  en: "Paraguay · Global reach",
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const line = TAGLINE[locale] ?? TAGLINE.en;
  const footer = FOOTER[locale] ?? FOOTER.en;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(145deg, #07080c 0%, #151821 45%, #07080c 100%)",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#f4f4f5",
              letterSpacing: "-0.03em",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Phoenix Global
          </span>
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#e8b84a",
              letterSpacing: "-0.03em",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Holding
          </span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 26,
            color: "rgba(244,244,245,0.82)",
            maxWidth: 920,
            lineHeight: 1.35,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {line}
        </div>
        <div
          style={{
            marginTop: 52,
            fontSize: 16,
            fontWeight: 600,
            color: "rgba(232,184,74,0.95)",
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {footer}
        </div>
      </div>
    ),
    { ...size },
  );
}
