"use client";

import { ChevronDown, ChevronUp, Download, Share2 } from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { RAI_TEAM_ID } from "@/data/mock";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import type { CompetitionZoneRule } from "@/lib/cms/competition-config-bundle";
import {
  downloadGameTicket,
  shareGameTicket,
  shareGameTicketOnX,
} from "@/lib/game-ticket-share";
import type { ClasificacionPrediction } from "@/lib/clasificacion-prediction";
import type { QuinigolPrediction } from "@/lib/quinigol";
import { isAvilesMatch, outcomeFromGoalsPicks } from "@/lib/quiniela";
import { scorerLabelForPlayer } from "@/lib/squad-player-resolve";
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
  clasificacion: "/juegos/el-oraculo.svg",
} satisfies Record<TicketKind, string | null>;

function TicketBrand({ kind }: { kind: TicketKind }) {
  const logo = logoByKind[kind];
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={`game-ticket-logo game-ticket-logo--${kind}`}
        src={logo}
        alt={kind === "quiniela" ? "RAIniela" : kind === "quinigol" ? "RAIGol" : "El Oráculo"}
      />
    );
  }
  return null;
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
    <section className="game-ticket-preview" aria-label="Boleto">
      <p className="game-ticket-preview-label">Tu boleto</p>
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

function outcomeMark(
  outcome: PredictionOutcome,
  selected: PredictionOutcome | undefined,
  options?: { disabled?: boolean; onPick?: (outcome: PredictionOutcome) => void },
) {
  return (
    <button
      type="button"
      className="game-ticket-pick"
      key={outcome}
      disabled={options?.disabled}
      onClick={() => options?.onPick?.(outcome)}
      aria-pressed={selected === outcome}
    >
      <span>{outcome}</span>
      {selected === outcome ? <b aria-label={`Marcado ${outcome}`}>X</b> : null}
    </button>
  );
}

function scoreMark(
  option: GoalsPick,
  selected: GoalsPick | undefined,
  options?: { disabled?: boolean; onPick?: (option: GoalsPick) => void },
) {
  return (
    <button
      type="button"
      className="game-ticket-score-pick"
      key={String(option)}
      disabled={options?.disabled}
      onClick={() => options?.onPick?.(option)}
      aria-pressed={selected === option}
    >
      <span>{option}</span>
      {selected === option ? <b aria-label={`Marcado ${option}`}>X</b> : null}
    </button>
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
  readOnly,
  onChange,
}: MatchTicketProps & {
  predictions: Record<string, Prediction>;
  readOnly?: boolean;
  onChange?: (prediction: Prediction) => void;
}) {
  const teamsById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const { squad } = useSquadPlayers("masculino");
  const scorerOptions = useMemo(
    () =>
      squad
        .filter((player) => player.posicion !== "Portero")
        .map((player) => scorerLabelForPlayer(player)),
    [squad],
  );
  const date = formatTicketDate(matches);
  const update = (match: Match, current: Prediction | undefined, patch: Partial<Prediction>) => {
    if (readOnly || !onChange) return;
    const next: Prediction = {
      matchId: match.id,
      matchday: match.matchday,
      outcome: current?.outcome,
      goalsHome: current?.goalsHome,
      goalsAway: current?.goalsAway,
      scorer: current?.scorer,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    if (isAvilesMatch(match)) {
      const avilesGoals = match.homeTeamId === RAI_TEAM_ID
        ? next.goalsHome
        : next.goalsAway;
      if (avilesGoals === 0) next.scorer = "nadie";
      if (avilesGoals !== undefined && avilesGoals !== 0 && next.scorer === "nadie") next.scorer = undefined;
      const derivedOutcome = outcomeFromGoalsPicks(next.goalsHome, next.goalsAway);
      if (derivedOutcome) next.outcome = derivedOutcome;
    }
    onChange(next);
  };

  return (
    <TicketFrame
      kind="quiniela"
      competitionLabel={competitionLabel}
      seasonLabel={seasonLabel}
      contextLabel={`Jornada ${round}${date ? ` · ${date}` : ""}`}
      title="Pronóstico"
      hint={readOnly ? "Boleto cerrado" : "Toca una casilla para marcar"}
      fileName={`mi-rainiela-jornada-${round}.png`}
      shareText={`Mi RAIniela de la jornada ${round} #RealAviles`}
    >
      <ol className="game-ticket-list">
        {matches.map((match, index) => {
          const prediction = predictions[match.id];
          const avilesMatch = isAvilesMatch(match);
          const derivedOutcome = avilesMatch
            ? outcomeFromGoalsPicks(prediction?.goalsHome, prediction?.goalsAway)
            : null;
          const selectedOutcome = derivedOutcome ?? prediction?.outcome;
          const avilesGoals = match.homeTeamId === RAI_TEAM_ID
            ? prediction?.goalsHome
            : prediction?.goalsAway;
          return (
            <li className={`game-ticket-match-row${avilesMatch ? " game-ticket-match-row--featured" : ""}`} key={match.id}>
              <span className="game-ticket-number">{index + 1}</span>
              <span className="game-ticket-teams">
                {teamName(match, "home", teamsById)} <i>–</i> {teamName(match, "away", teamsById)}
              </span>
              <span className="game-ticket-picks">
                {(["1", "X", "2"] as PredictionOutcome[]).map((outcome) =>
                  outcomeMark(outcome, selectedOutcome, {
                    disabled: readOnly || derivedOutcome !== null,
                    onPick: (picked) => update(match, prediction, { outcome: picked }),
                  }),
                )}
              </span>
              {avilesMatch ? (
                <div className="game-ticket-featured">
                  <span className="game-ticket-featured-label">Marcador</span>
                  <div className="game-ticket-featured-score">
                    <span>{teamName(match, "home", teamsById)}</span>
                    <div>
                      {([0, 1, 2, "M"] as GoalsPick[]).map((option) =>
                        scoreMark(option, prediction?.goalsHome, {
                          disabled: readOnly,
                          onPick: (picked) => update(match, prediction, { goalsHome: picked }),
                        }),
                      )}
                    </div>
                  </div>
                  <div className="game-ticket-featured-score">
                    <span>{teamName(match, "away", teamsById)}</span>
                    <div>
                      {([0, 1, 2, "M"] as GoalsPick[]).map((option) =>
                        scoreMark(option, prediction?.goalsAway, {
                          disabled: readOnly,
                          onPick: (picked) => update(match, prediction, { goalsAway: picked }),
                        }),
                      )}
                    </div>
                  </div>
                  <label className="game-ticket-scorer">
                    <span>Goleador</span>
                    <input
                      type="text"
                      list={`game-ticket-scorers-${match.id}`}
                      value={prediction?.scorer === "nadie" ? "Nadie" : prediction?.scorer ?? ""}
                      disabled={readOnly || avilesGoals === 0}
                      placeholder="Elige o escribe"
                      onChange={(event) =>
                        update(match, prediction, {
                          scorer: event.target.value.toLocaleLowerCase("es") === "nadie"
                            ? "nadie"
                            : event.target.value || undefined,
                        })
                      }
                    />
                    <datalist id={`game-ticket-scorers-${match.id}`}>
                      <option value="Nadie" />
                      {scorerOptions.map((scorer) => (
                        <option key={scorer} value={scorer} />
                      ))}
                    </datalist>
                  </label>
                </div>
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
  readOnly,
  onChange,
}: MatchTicketProps & {
  predictions: Record<string, QuinigolPrediction>;
  readOnly?: boolean;
  onChange?: (prediction: QuinigolPrediction) => void;
}) {
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
          const update = (patch: Partial<Pick<QuinigolPrediction, "goalsHome" | "goalsAway">>) => {
            if (readOnly || !onChange) return;
            onChange({
              matchId: match.id,
              matchday: match.matchday,
              goalsHome: patch.goalsHome ?? prediction?.goalsHome,
              goalsAway: patch.goalsAway ?? prediction?.goalsAway,
              updatedAt: new Date().toISOString(),
            });
          };
          return (
            <li className="game-ticket-match-row game-ticket-match-row--score" key={match.id}>
              <span className="game-ticket-number">{index + 1}</span>
              <span className="game-ticket-teams">
                {teamName(match, "home", teamsById)} <i>–</i> {teamName(match, "away", teamsById)}
              </span>
              <span className="game-ticket-score">
                <span>
                  {scoreOptions.map((option) =>
                    scoreMark(option, prediction?.goalsHome, {
                      disabled: readOnly,
                      onPick: (picked) => update({ goalsHome: picked }),
                    }),
                  )}
                </span>
                <i>–</i>
                <span>
                  {scoreOptions.map((option) =>
                    scoreMark(option, prediction?.goalsAway, {
                      disabled: readOnly,
                      onPick: (picked) => update({ goalsAway: picked }),
                    }),
                  )}
                </span>
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
  readOnly,
  onReorder,
}: {
  teams: Team[];
  predictions: Record<string, ClasificacionPrediction>;
  zones: CompetitionZoneRule[];
  seasonLabel: string;
  competitionLabel: string;
  readOnly?: boolean;
  onReorder?: (teamIds: string[]) => void;
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
  const moveTeam = (from: number, to: number) => {
    if (readOnly || !onReorder || to < 0 || to >= orderedTeams.length) return;
    const next = orderedTeams.map((team) => team.id);
    const [teamId] = next.splice(from, 1);
    if (!teamId) return;
    next.splice(to, 0, teamId);
    onReorder(next);
  };

  return (
    <TicketFrame
      kind="clasificacion"
      competitionLabel={competitionLabel}
      seasonLabel={seasonLabel}
      contextLabel="Clasificación final"
      title="El Oráculo · clasificación final"
      hint={readOnly ? "Pronóstico cerrado" : "Usa las flechas para ordenar"}
      fileName={`mi-oraculo-${seasonLabel.replaceAll("/", "-")}.png`}
      shareText={`Mi Oráculo para la clasificación final de la temporada ${seasonLabel} #RealAviles`}
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
              {!readOnly && onReorder ? (
                <span className="game-ticket-order-controls">
                  <button type="button" disabled={index === 0} onClick={() => moveTeam(index, index - 1)} aria-label={`Subir ${team.name}`}>
                    <ChevronUp size={13} />
                  </button>
                  <button type="button" disabled={index === orderedTeams.length - 1} onClick={() => moveTeam(index, index + 1)} aria-label={`Bajar ${team.name}`}>
                    <ChevronDown size={13} />
                  </button>
                </span>
              ) : null}
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
