import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { ClasificacionOgShareData } from "@/lib/clasificacion/og-share-data";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

async function loadBebasFont(): Promise<ArrayBuffer> {
  const fontPath = path.join(process.cwd(), "lib/clasificacion/fonts/BebasNeue-Regular.ttf");
  const buffer = await readFile(fontPath);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function splitRows(rows: ClasificacionOgShareData["rows"]) {
  const midpoint = Math.ceil(rows.length / 2);
  return {
    left: rows.slice(0, midpoint),
    right: rows.slice(midpoint),
  };
}

function StandingsColumn({
  rows,
  startIndex,
}: {
  rows: ClasificacionOgShareData["rows"];
  startIndex: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      {rows.map((row, index) => (
        <div
          key={row.teamId}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 8px",
            borderRadius: 10,
            background: row.isAviles ? "rgba(33, 76, 155, 0.14)" : "rgba(255,255,255,0.72)",
            border: row.isAviles ? "2px solid #214C9B" : "1px solid rgba(33, 76, 155, 0.12)",
          }}
        >
          <span
            style={{
              width: 24,
              fontSize: 18,
              fontWeight: 700,
              color: row.isAviles ? "#214C9B" : "#475569",
              textAlign: "center",
            }}
          >
            {startIndex + index + 1}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.crestUrl}
            alt=""
            width={24}
            height={24}
            style={{ objectFit: "contain" }}
          />
          <span
            style={{
              flex: 1,
              fontSize: 15,
              fontWeight: 700,
              color: row.isAviles ? "#214C9B" : "#0f172a",
              overflow: "hidden",
            }}
          >
            {row.shortName}
          </span>
          {row.points !== null ? (
            <span style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>{row.points} pts</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export async function renderClasificacionOgImage(data: ClasificacionOgShareData) {
  const bebas = await loadBebasFont();
  const { left, right } = splitRows(data.rows);
  const standingsLabel = data.hasStandings ? "Clasificación actual" : "20 equipos del Grupo I";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0b1f45 0%, #214C9B 48%, #981915 100%)",
          fontFamily: "Bebas Neue",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -60,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 430,
            padding: "48px 40px",
            color: "white",
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.82)",
              marginBottom: 12,
            }}
          >
            Juego de clasificación
          </div>
          <div
            style={{
              fontSize: 74,
              lineHeight: 0.92,
              letterSpacing: 1,
              marginBottom: 18,
            }}
          >
            ¿CÓMO ACABARÁ LA LIGA?
          </div>
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.2,
              color: "rgba(255,255,255,0.9)",
              marginBottom: 28,
              maxWidth: 360,
            }}
          >
            Ordena el Grupo I, compite en el ranking y comparte tu pronóstico.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.22)",
              fontSize: 20,
              letterSpacing: 1,
              alignSelf: "flex-start",
            }}
          >
            Temporada {data.seasonLabel}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 18,
              letterSpacing: 2,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            RAI1903 · 1ª RFEF
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 34,
            top: 34,
            width: 700,
            height: 560,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(-5deg)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: "22px 24px",
              borderRadius: 24,
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 28px 80px rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.65)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 30, color: "#214C9B", letterSpacing: 1 }}>{standingsLabel}</div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#981915",
                  background: "rgba(152, 25, 21, 0.1)",
                  padding: "6px 12px",
                  borderRadius: 999,
                }}
              >
                Pronósticos
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flex: 1 }}>
              <StandingsColumn rows={left} startIndex={0} />
              <StandingsColumn rows={right} startIndex={left.length} />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      fonts: [{ name: "Bebas Neue", data: bebas, style: "normal", weight: 400 }],
    },
  );
}
