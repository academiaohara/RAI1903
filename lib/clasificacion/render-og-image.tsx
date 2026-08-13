import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { ClasificacionOgShareData } from "@/lib/clasificacion/og-share-data";
import { crestSpriteBackgroundPosition, type CrestSpriteSheet } from "@/lib/clasificacion/og-crest";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

async function loadFont(fileName: string): Promise<ArrayBuffer> {
  const fontPath = path.join(process.cwd(), "lib/clasificacion/fonts", fileName);
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

function CrestBadge({
  sprite,
  crestIndex,
  initials,
  isAviles,
}: {
  sprite: CrestSpriteSheet;
  crestIndex: number;
  initials: string;
  isAviles: boolean;
}) {
  const { x, y } = crestSpriteBackgroundPosition(sprite, crestIndex);

  return (
    <div
      style={{
        width: 22,
        height: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${sprite.dataUri})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${sprite.width}px ${sprite.height}px`,
        backgroundPosition: `-${x}px -${y}px`,
      }}
    >
      {!sprite.dataUri ? (
        <span
          style={{
            fontFamily: "Inter",
            fontSize: 8,
            fontWeight: 600,
            color: isAviles ? "#214C9B" : "#475569",
          }}
        >
          {initials.slice(0, 3)}
        </span>
      ) : null}
    </div>
  );
}

function StandingsColumn({
  rows,
  sprite,
  startIndex,
}: {
  rows: ClasificacionOgShareData["rows"];
  sprite: CrestSpriteSheet;
  startIndex: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
      {rows.map((row, index) => (
        <div
          key={row.teamId}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 6px",
            borderRadius: 8,
            background: row.isAviles ? "rgba(33, 76, 155, 0.14)" : "rgba(255,255,255,0.72)",
            border: row.isAviles ? "2px solid #214C9B" : "1px solid rgba(33, 76, 155, 0.12)",
          }}
        >
          <span
            style={{
              width: 18,
              fontSize: 14,
              fontWeight: 700,
              color: row.isAviles ? "#214C9B" : "#475569",
              textAlign: "center",
              fontFamily: "Inter",
            }}
          >
            {startIndex + index + 1}
          </span>
          <CrestBadge
            sprite={sprite}
            crestIndex={row.crestIndex}
            initials={row.crestInitials}
            isAviles={row.isAviles}
          />
          <span
            style={{
              flex: 1,
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1.15,
              color: row.isAviles ? "#214C9B" : "#0f172a",
              fontFamily: "Inter",
            }}
          >
            {row.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export async function renderClasificacionOgImage(data: ClasificacionOgShareData) {
  const [bebas, inter] = await Promise.all([loadFont("BebasNeue-Regular.ttf"), loadFont("Inter-SemiBold.ttf")]);
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
            width: 360,
            padding: "44px 32px",
            color: "white",
          }}
        >
          <div
            style={{
              fontSize: 20,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.82)",
              marginBottom: 10,
            }}
          >
            Juego de clasificación
          </div>
          <div
            style={{
              fontSize: 68,
              lineHeight: 0.92,
              letterSpacing: 1,
              marginBottom: 16,
            }}
          >
            ¿CÓMO ACABARÁ LA LIGA?
          </div>
          <div
            style={{
              fontSize: 22,
              lineHeight: 1.2,
              color: "rgba(255,255,255,0.9)",
              marginBottom: 24,
              maxWidth: 320,
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
              fontSize: 18,
              letterSpacing: 1,
              alignSelf: "flex-start",
            }}
          >
            Temporada {data.seasonLabel}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 16,
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
            right: 24,
            top: 28,
            width: 790,
            height: 572,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(-3deg)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: "18px 20px",
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
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 28, color: "#214C9B", letterSpacing: 1 }}>{standingsLabel}</div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#981915",
                  background: "rgba(152, 25, 21, 0.1)",
                  padding: "5px 10px",
                  borderRadius: 999,
                  fontFamily: "Inter",
                }}
              >
                Pronósticos
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flex: 1 }}>
              <StandingsColumn rows={left} sprite={data.crestSprite} startIndex={0} />
              <StandingsColumn rows={right} sprite={data.crestSprite} startIndex={left.length} />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      fonts: [
        { name: "Bebas Neue", data: bebas, style: "normal", weight: 400 },
        { name: "Inter", data: inter, style: "normal", weight: 600 },
      ],
    },
  );
}
