"use client";

import { Download, Share2 } from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import type { CompetitionZoneRule } from "@/lib/cms/competition-config-bundle";
import {
  downloadGameTicket,
  shareGameTicket,
  shareGameTicketOnX,
} from "@/lib/game-ticket-share";
import type { ClasificacionPrediction } from "@/lib/clasificacion-prediction";
import type { QuinigolPrediction } from "@/lib/quinigol";
import { getTeamCrestById, isTeamCrestUrl } from "@/lib/team-crests";
import type { GoalsPick, Match, Prediction, PredictionOutcome, Team } from "@/types";

type TicketKind = "quiniela" | "quinigol" | "clasificacion";

type TicketFrameProps = {
  kind: TicketKind;
  competitionLabel: string;
  seasonLabel: string;
  contextLabel: string;
  title: string;
  hint?: string;
  fileName: string;
  shareText: string;
  children: ReactNode;
};

const logoByKind = {
  quiniela: "/juegos/rainiela.svg",
  quinigol: "/juegos/raigol.svg",
  clasificacion: null,
} satisfies Record<TicketKind, string | null>;

function TicketBrand({ kind }: { kind: TicketKind }) {
  const logo = logoByKind[kind];
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={`game-ticket-logo game-ticket-logo--${kind}`}
        src={logo}
        alt={kind === "quiniela" ? "RAIniela" : "RAIGol"}
      />
    );
  }

  return (
    <span className="game-ticket-wordmark" aria-label="RAIClasifica">
      RAI<span>Clasifica</span>
    </span>
  );
}

function TicketFrame({
  kind,
  competitionLabel,
  seasonLabel,
  contextLabel,
  title,
  hint,
  fileName,
  shareText,
  children,
}: TicketFrameProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  const run = async (action: "share" | "x" | "download") => {
    if (!ticketRef.current || sharing) return;
    setSharing(true);
    try {
      const options = { node: ticketRef.current, fileName, shareText };
      if (action === "share") await shareGameTicket(options);
      if (action === "x") await shareGameTicketOnX(options);
      if (action === "download") await downloadGameTicket(options);
    } finally {
      setSharing(false);
    }
  };

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <section className="game-ticket-preview" aria-label="Boleto para compartir">
      <p className="game-ticket-preview-label">Vista previa para compartir</p>
      <div ref={ticketRef} className={`game-ticket game-ticket--${kind}`}>
        <header className="game-ticket-header">
          <TicketBrand kind={kind} />
          <div className="game-ticket-meta">
            <strong>{competitionLabel}</strong>
            <span>{seasonLabel}</span>
            <span>{contextLabel}</span>
          </div>
        </header>
        <div className="game-ticket-subheader">
          <strong>{title}</strong>
          {hint ? <span>{hint}</span> : null}
        </div>
        {children}
        <footer className="game-ticket-footer">
          <span>Generado en realaviles.com/juegos</span>
          <strong>#RealAviles</strong>
          <span>Acierta y comparte ↗</span>
        </footer>
      </div>

      <div className="game-ticket-actions">
        {canNativeShare ? (
          <button type="button" disabled={sharing} onClick={() => void run("share")}>
            <Share2 size={16} aria-hidden />
            {sharing ? "Generando…" : "Compartir"}
          </button>
        ) : null}
        <button type="button" disabled={sharing} onClick={() => void run("x")}>
          X
          <span>{sharing ? "Generando…" : "Compartir en X"}</span>
        </button>
        <button type="button" disabled={sharing} onClick={() => void run("download")}>
          <Download size={16} aria-hidden />
          Descargar imagen
        </button>
      </div>
    </section>
  );
}

function teamName(match: Match, side: "home" | "away", teamsById: Map<string, Team>): string {
  const teamId = side === "home" ? match.homeTeamId : match.awayTeamId;
  const fallback = side === "home" ? match.homeTeam : match.awayTeam;
  return teamsById.get(teamId)?.name ?? fallback;
}

function outcomeMark(outcome: PredictionOutcome, selected: PredictionOutcome | undefined) {
  return (
    <span className="game-ticket-pick" key={outcome}>
      <span>{outcome}</span>
      {selected === outcome ? <b aria-label={`Marcado ${outcome}`}>X</b> : null}
    </span>
  );
}

function scoreMark(option: GoalsPick, selected: GoalsPick | undefined) {
  return (
    <span className="game-ticket-score-pick" key={String(option)}>
      <span>{option}</span>
      {selected === option ? <b aria-label={`Marcado ${option}`}>X</b> : null}
    </span>
  );
}

function formatTicketDate(matches: Match[]): string {
  const firstDate = matches.map((match) => new Date(match.date)).find((date) => !Number.isNaN(date.getTime()));
  if (!firstDate) return "";
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(firstDate);
}

type MatchTicketProps = {
  matches: Match[];
  teams: Team[];
  round: number;
  seasonLabel: string;
  competitionLabel: string;
};

export function QuinielaTicket({
  matches,
  teams,
  predictions,
  round,
  seasonLabel,
  competitionLabel,
}: MatchTicketProps & { predictions: Record<string, Prediction> }) {
  const teamsById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const date = formatTicketDate(matches);

  return (
    <TicketFrame
      kind="quiniela"
      competitionLabel={competitionLabel}
      seasonLabel={seasonLabel}
      contextLabel={`Jornada ${round}${date ? ` · ${date}` : ""}`}
      title="Pronóstico"
      hint="Boleto 1 · X · 2"
      fileName={`mi-rainiela-jornada-${round}.png`}
      shareText={`Mi RAIniela de la jornada ${round} #RealAviles`}
    >
      <ol className="game-ticket-list">
        {matches.map((match, index) => {
          const prediction = predictions[match.id];
          return (
            <li className="game-ticket-match-row" key={match.id}>
              <span className="game-ticket-number">{index + 1}</span>
              <span className="game-ticket-teams">
                {teamName(match, "home", teamsById)} <i>–</i> {teamName(match, "away", teamsById)}
              </span>
              <span className="game-ticket-picks">
                {(["1", "X", "2"] as PredictionOutcome[]).map((outcome) =>
                  outcomeMark(outcome, prediction?.outcome),
                )}
              </span>
              {prediction?.scorer ? (
                <span className="game-ticket-scorer">Goleador: {prediction.scorer === "nadie" ? "Nadie" : prediction.scorer}</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </TicketFrame>
  );
}

export function QuinigolTicket({
  matches,
  teams,
  predictions,
  round,
  seasonLabel,
  competitionLabel,
}: MatchTicketProps & { predictions: Record<string, QuinigolPrediction> }) {
  const teamsById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const date = formatTicketDate(matches);
  const scoreOptions: GoalsPick[] = [0, 1, 2, "M"];

  return (
    <TicketFrame
      kind="quinigol"
      competitionLabel={competitionLabel}
      seasonLabel={seasonLabel}
      contextLabel={`Jornada ${round}${date ? ` · ${date}` : ""}`}
      title="Marcador exacto"
      hint="M = 3 o más goles"
      fileName={`mi-raigol-jornada-${round}.png`}
      shareText={`Mi RAIGol de la jornada ${round} #RealAviles`}
    >
      <ol className="game-ticket-list">
        {matches.map((match, index) => {
          const prediction = predictions[match.id];
          return (
            <li className="game-ticket-match-row game-ticket-match-row--score" key={match.id}>
              <span className="game-ticket-number">{index + 1}</span>
              <span className="game-ticket-teams">
                {teamName(match, "home", teamsById)} <i>–</i> {teamName(match, "away", teamsById)}
              </span>
              <span className="game-ticket-score">
                <span>{scoreOptions.map((option) => scoreMark(option, prediction?.goalsHome))}</span>
                <i>–</i>
                <span>{scoreOptions.map((option) => scoreMark(option, prediction?.goalsAway))}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </TicketFrame>
  );
}

type PositionedZone = {
  label: string;
  color: string;
};

const zoneColorById: Record<string, string> = {
  promotion: "#22a06b",
  playoff: "#38a8d8",
  playout: "#e6a23c",
  relegation: "#d81f43",
};

function cssColorForZone(zone: CompetitionZoneRule): string {
  if (zone.colorClass.includes("emerald")) return "#22a06b";
  if (zone.colorClass.includes("sky")) return "#38a8d8";
  if (zone.colorClass.includes("amber")) return "#e6a23c";
  if (zone.colorClass.includes("rose") || zone.colorClass.includes("red")) return "#d81f43";
  return zoneColorById[zone.id] ?? "#214c9b";
}

function zonesByPosition(teamCount: number, zones: CompetitionZoneRule[]): Map<number, PositionedZone> {
  const result = new Map<number, PositionedZone>();
  let topCursor = 1;
  let bottomCursor = teamCount;

  zones.forEach((zone) => {
    const color = cssColorForZone(zone);
    for (let offset = 0; offset < zone.count; offset += 1) {
      const position = zone.from === "top" ? topCursor + offset : bottomCursor - offset;
      if (position >= 1 && position <= teamCount && !result.has(position)) {
        result.set(position, { label: zone.label, color });
      }
    }
    if (zone.from === "top") topCursor += zone.count;
    else bottomCursor -= zone.count;
  });
  return result;
}

function TicketCrest({ team }: { team: Team }) {
  const crest = getTeamCrestById(team.id, team.crestInitials);
  if (isTeamCrestUrl(crest)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="game-ticket-crest" src={crest} alt="" />;
  }
  return <span className="game-ticket-crest-fallback">{crest}</span>;
}

export function ClasificacionTicket({
  teams,
  predictions,
  zones,
  seasonLabel,
  competitionLabel,
}: {
  teams: Team[];
  predictions: Record<string, ClasificacionPrediction>;
  zones: CompetitionZoneRule[];
  seasonLabel: string;
  competitionLabel: string;
}) {
  const orderedTeams = useMemo(
    () =>
      [...teams].sort(
        (a, b) =>
          (predictions[a.id]?.position ?? Number.MAX_SAFE_INTEGER) -
            (predictions[b.id]?.position ?? Number.MAX_SAFE_INTEGER) ||
          a.name.localeCompare(b.name, "es"),
      ),
    [predictions, teams],
  );
  const positionZones = useMemo(() => zonesByPosition(orderedTeams.length, zones), [orderedTeams.length, zones]);
  const legend = zones.filter((zone) => zone.count > 0);

  return (
    <TicketFrame
      kind="clasificacion"
      competitionLabel={competitionLabel}
      seasonLabel={seasonLabel}
      contextLabel="Clasificación final"
      title="Clasificación final prevista"
      fileName={`mi-clasificacion-${seasonLabel.replaceAll("/", "-")}.png`}
      shareText={`Mi clasificación final prevista para la temporada ${seasonLabel} #RealAviles`}
    >
      <ol className="game-ticket-list game-ticket-standings">
        {orderedTeams.map((team, index) => {
          const position = index + 1;
          const zone = positionZones.get(position);
          return (
            <li
              className="game-ticket-standing-row"
              key={team.id}
              style={zone ? { borderLeftColor: zone.color, backgroundColor: `${zone.color}12` } : undefined}
            >
              <span className="game-ticket-number">{position}</span>
              <TicketCrest team={team} />
              <strong>{team.name}</strong>
            </li>
          );
        })}
      </ol>
      <div className="game-ticket-legend">
        {legend.map((zone) => (
          <span key={zone.id}>
            <i style={{ backgroundColor: cssColorForZone(zone) }} />
            {zone.label}
          </span>
        ))}
      </div>
    </TicketFrame>
  );
}
