"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Download, Eye, Pencil, Save, Search, Share2 } from "lucide-react";
import { useCallback, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { GameLoginPromptModal } from "@/components/juegos/GameLoginPromptModal";
import { MatchPreviewModal } from "@/components/MatchPreviewModal";
import { Modal } from "@/components/Modal";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { RAI_TEAM_ID } from "@/data/mock";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import type { CompetitionZoneRule } from "@/lib/cms/competition-config-bundle";
import {
  downloadGameTicket,
  shareGameTicket,
  shareGameTicketOnX,
} from "@/lib/game-ticket-share";
import type { ClasificacionPrediction } from "@/lib/clasificacion-prediction";
import {
  getPositionDiff,
  scoreClasificacionPosition,
} from "@/lib/clasificacion-prediction";
import { defaultCronicaId } from "@/lib/match-article-factory";
import { hasSeenGameLoginPrompt, markGameLoginPromptSeen } from "@/lib/game-login-prompt";
import { getGameTicketFooterUrl } from "@/lib/auth/site-url";
import { getMatchArticlePageHref } from "@/lib/match-article-url";
import { isMatchPlayed } from "@/lib/match-result";
import type { QuinigolPrediction } from "@/lib/quinigol";
import { actualOutcome, isAvilesMatch, isFeaturedTeamMatch, outcomeFromGoalsPicks } from "@/lib/quiniela";
import { resolveSquadPlayerByName, scorerLabelForPlayer } from "@/lib/squad-player-resolve";
import { getPlayerDisplayName } from "@/lib/squad-utils";
import { getTeamCrestById, isTeamCrestUrl } from "@/lib/team-crests";
import type { GoalsPick, Match, Prediction, PredictionOutcome, Team } from "@/types";
import type { SquadPlayer } from "@/types/squad";

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
  creatorHandle?: string;
  points?: number;
  receipt?: ReactNode;
  showActions?: boolean;
  canSave?: boolean;
  canEdit?: boolean;
  onSave?: () => void;
  onEdit?: () => void;
  saveDisabled?: boolean;
  isEditing?: boolean;
  showLoginPrompt?: boolean;
  children: ReactNode;
};

const logoByKind = {
  quiniela: "/juegos/rainielav2.svg",
  quinigol: "/juegos/raigol.svg",
  clasificacion: "/api/game-logo/oraculo",
} satisfies Record<TicketKind, string | null>;

function QuinielaReceipt({
  matches,
  predictions,
  round,
  competitionLabel,
  creatorHandle = "@usuario",
  savedAt,
  points,
}: {
  matches: Match[];
  predictions: Record<string, Prediction>;
  round: number;
  competitionLabel: string;
  creatorHandle?: string;
  savedAt?: string;
  points?: number;
}) {
  const avilesMatch = matches.find((match) => isAvilesMatch(match));
  const avilesPrediction = avilesMatch ? predictions[avilesMatch.id] : undefined;
  const picks = matches.map((match) => {
    const prediction = predictions[match.id];
    const derivedOutcome = isAvilesMatch(match)
      ? outcomeFromGoalsPicks(prediction?.goalsHome, prediction?.goalsAway)
      : null;
    return derivedOutcome ?? prediction?.outcome ?? "-";
  });
  const filledCount = picks.filter((pick) => pick !== "-").length;
  const marcador = avilesPrediction
    ? `${avilesPrediction.goalsHome ?? "-"} : ${avilesPrediction.goalsAway ?? "-"}`
    : "- : -";
  const goleador = formatScorerLabel(normalizeScorerValue(avilesPrediction?.scorer)) || "-";
  const savedDate = savedAt ? new Date(savedAt) : null;
  const refCode = savedDate
    ? String(savedDate.getTime()).slice(-5)
    : String(round * 137 + filledCount * 17).padStart(5, "0").slice(-5);
  const metaDate = savedDate
    ? savedDate.toLocaleDateString("es-ES")
    : new Date().toLocaleDateString("es-ES");
  const metaTime = savedDate
    ? savedDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const handle = creatorHandle.startsWith("@") ? creatorHandle : `@${creatorHandle}`;

  return (
    <aside className="game-ticket-receipt" aria-label="Comprobante RAIniela">
      <div className="game-ticket-receipt-tri game-ticket-receipt-tri--top" />
      <div className="game-ticket-receipt-inner">
        <ReceiptGameLogo kind="quiniela" />
        <span className="game-ticket-receipt-subtitle">COMPROBANTE</span>
        <hr className="game-ticket-receipt-hr" />
        <div className="game-ticket-receipt-lines">
          {picks.map((pick, index) => (
            <div className="game-ticket-receipt-line" key={`${index + 1}-${pick}`}>
              <span>{index + 1}.</span>
              <span>{pick}</span>
            </div>
          ))}
        </div>
        <hr className="game-ticket-receipt-hr" />
        <div className="game-ticket-receipt-line">
          <span>Marcador</span>
          <span>{marcador}</span>
        </div>
        <div className="game-ticket-receipt-line">
          <span>Goleador</span>
          <span>{goleador}</span>
        </div>
        {typeof points === "number" ? (
          <div className="game-ticket-receipt-line game-ticket-receipt-line--points">
            <span>Puntos</span>
            <span>{points}</span>
          </div>
        ) : null}
        <hr className="game-ticket-receipt-hr" />
        <p className="game-ticket-receipt-meta">
          Jornada {round} · {competitionLabel}
          <br />
          Ref. {refCode}
          <br />
          {metaDate} · {metaTime}h
        </p>
        <p className="game-ticket-receipt-stamp">
          {savedAt ? "GUARDADO CORRECTAMENTE" : "BORRADOR"}
        </p>
        <ReceiptCreatorHandle creatorHandle={handle} />
      </div>
      <div className="game-ticket-receipt-tri game-ticket-receipt-tri--bottom" />
    </aside>
  );
}

function formatGoalsPickLabel(value: GoalsPick | undefined): string {
  if (value === undefined) return "-";
  return String(value);
}

function QuinigolReceipt({
  matches,
  predictions,
  round,
  competitionLabel,
  creatorHandle = "@usuario",
  savedAt,
  points,
}: {
  matches: Match[];
  predictions: Record<string, QuinigolPrediction>;
  round: number;
  competitionLabel: string;
  creatorHandle?: string;
  savedAt?: string;
  points?: number;
}) {
  const picks = matches.map((match) => {
    const prediction = predictions[match.id];
    const home = formatGoalsPickLabel(prediction?.goalsHome);
    const away = formatGoalsPickLabel(prediction?.goalsAway);
    return home === "-" && away === "-" ? "-" : `${home}-${away}`;
  });
  const filledCount = picks.filter((pick) => pick !== "-").length;
  const savedDate = savedAt ? new Date(savedAt) : null;
  const refCode = savedDate
    ? String(savedDate.getTime()).slice(-5)
    : String(round * 137 + filledCount * 17).padStart(5, "0").slice(-5);
  const metaDate = savedDate
    ? savedDate.toLocaleDateString("es-ES")
    : new Date().toLocaleDateString("es-ES");
  const metaTime = savedDate
    ? savedDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const handle = creatorHandle.startsWith("@") ? creatorHandle : `@${creatorHandle}`;

  return (
    <aside className="game-ticket-receipt" aria-label="Comprobante RAIGol">
      <div className="game-ticket-receipt-tri game-ticket-receipt-tri--top" />
      <div className="game-ticket-receipt-inner">
        <ReceiptGameLogo kind="quinigol" />
        <span className="game-ticket-receipt-subtitle">COMPROBANTE</span>
        <hr className="game-ticket-receipt-hr" />
        <div className="game-ticket-receipt-lines">
          {picks.map((pick, index) => (
            <div className="game-ticket-receipt-line" key={`${index + 1}-${pick}`}>
              <span>{index + 1}.</span>
              <span>{pick}</span>
            </div>
          ))}
        </div>
        {typeof points === "number" ? (
          <>
            <hr className="game-ticket-receipt-hr" />
            <div className="game-ticket-receipt-line game-ticket-receipt-line--points">
              <span>Puntos</span>
              <span>{points}</span>
            </div>
          </>
        ) : null}
        <hr className="game-ticket-receipt-hr" />
        <p className="game-ticket-receipt-meta">
          Jornada {round} · {competitionLabel}
          <br />
          Ref. {refCode}
          <br />
          {metaDate} · {metaTime}h
        </p>
        <p className="game-ticket-receipt-stamp">
          {savedAt ? "GUARDADO CORRECTAMENTE" : "BORRADOR"}
        </p>
        <ReceiptCreatorHandle creatorHandle={handle} />
      </div>
      <div className="game-ticket-receipt-tri game-ticket-receipt-tri--bottom" />
    </aside>
  );
}

function ClasificacionReceipt({
  teams,
  predictions,
  seasonLabel,
  competitionLabel,
  creatorHandle = "@usuario",
  savedAt,
  points,
}: {
  teams: Team[];
  predictions: Record<string, ClasificacionPrediction>;
  seasonLabel: string;
  competitionLabel: string;
  creatorHandle?: string;
  savedAt?: string;
  points?: number;
}) {
  const orderedTeams = [...teams].sort(
    (a, b) =>
      (predictions[a.id]?.position ?? Number.MAX_SAFE_INTEGER) -
        (predictions[b.id]?.position ?? Number.MAX_SAFE_INTEGER) ||
      a.name.localeCompare(b.name, "es"),
  );
  const filledCount = orderedTeams.filter((team) => predictions[team.id]?.position).length;
  const savedDate = savedAt ? new Date(savedAt) : null;
  const refCode = savedDate
    ? String(savedDate.getTime()).slice(-5)
    : String(filledCount * 19 + orderedTeams.length).padStart(5, "0").slice(-5);
  const metaDate = savedDate
    ? savedDate.toLocaleDateString("es-ES")
    : new Date().toLocaleDateString("es-ES");
  const metaTime = savedDate
    ? savedDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const handle = creatorHandle.startsWith("@") ? creatorHandle : `@${creatorHandle}`;

  return (
    <aside className="game-ticket-receipt" aria-label="Comprobante El Oráculo">
      <div className="game-ticket-receipt-tri game-ticket-receipt-tri--top" />
      <div className="game-ticket-receipt-inner">
        <ReceiptGameLogo kind="clasificacion" />
        <span className="game-ticket-receipt-subtitle">COMPROBANTE</span>
        <hr className="game-ticket-receipt-hr" />
        <div className="game-ticket-receipt-lines">
          {orderedTeams.map((team, index) => (
            <div className="game-ticket-receipt-line" key={team.id}>
              <span>{index + 1}.</span>
              <span>{team.shortName || team.name}</span>
            </div>
          ))}
        </div>
        {typeof points === "number" ? (
          <>
            <hr className="game-ticket-receipt-hr" />
            <div className="game-ticket-receipt-line game-ticket-receipt-line--points">
              <span>Puntos</span>
              <span>{points}</span>
            </div>
          </>
        ) : null}
        <hr className="game-ticket-receipt-hr" />
        <p className="game-ticket-receipt-meta">
          {seasonLabel} · {competitionLabel}
          <br />
          Ref. {refCode}
          <br />
          {metaDate} · {metaTime}h
        </p>
        <p className="game-ticket-receipt-stamp">
          {savedAt ? "GUARDADO CORRECTAMENTE" : "BORRADOR"}
        </p>
        <ReceiptCreatorHandle creatorHandle={handle} />
      </div>
      <div className="game-ticket-receipt-tri game-ticket-receipt-tri--bottom" />
    </aside>
  );
}

function ReceiptGameLogo({ kind }: { kind: TicketKind }) {
  const logo = logoByKind[kind];
  if (!logo) return null;
  return (
    <div className="game-ticket-receipt-logo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={`game-ticket-receipt-game-logo game-ticket-receipt-game-logo--${kind}`}
        src={logo}
        alt=""
      />
    </div>
  );
}

function TicketBrand({ kind }: { kind: TicketKind }) {
  const logo = logoByKind[kind];
  const label = kind === "quiniela" ? "RAIniela" : kind === "quinigol" ? "RAIGol" : "El Oráculo";
  if (!logo) return null;
  return (
    <div className="game-ticket-brand" aria-label={label}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={`game-ticket-logo game-ticket-logo--${kind}`}
        src={logo}
        alt=""
      />
    </div>
  );
}

function TicketMatchPreview({ match }: { match: Match }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { getForMatch } = useSeasonMatchArticles();
  const avilesMatch = isAvilesMatch(match);
  const avilesArticleHref = useMemo(() => {
    if (!avilesMatch) return null;
    const article = getForMatch(match.id, "masculino");
    return getMatchArticlePageHref(match.id, "masculino", article?.id ?? defaultCronicaId(match.id, "masculino"));
  }, [avilesMatch, getForMatch, match.id]);
  const avilesArticleLabel = isMatchPlayed(match) ? "Crónica" : "Previa";
  const previewClass = "game-ticket-match-preview";

  if (avilesMatch && avilesArticleHref) {
    return (
      <Link
        href={avilesArticleHref}
        className={previewClass}
        data-ticket-export-hidden="true"
        aria-label={avilesArticleLabel}
        title={avilesArticleLabel}
      >
        <Eye size={13} aria-hidden />
      </Link>
    );
  }

  if (avilesMatch) return null;

  return (
    <>
      <button
        type="button"
        className={previewClass}
        data-ticket-export-hidden="true"
        onClick={() => setPreviewOpen(true)}
        aria-label="Ver previa"
        title="Previa"
      >
        <Eye size={13} aria-hidden />
      </button>
      <MatchPreviewModal match={match} open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </>
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
  creatorHandle = "@usuario",
  points,
  receipt,
  showActions = true,
  canSave,
  canEdit,
  onSave,
  onEdit,
  saveDisabled,
  isEditing,
  showLoginPrompt = false,
  children,
}: TicketFrameProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const footerUrl = getGameTicketFooterUrl(kind);

  const handleTicketInteract = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!showLoginPrompt || hasSeenGameLoginPrompt()) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const interactive = target.closest(
        "button.game-ticket-pick, button.game-ticket-score-pick, button.game-ticket-scorer-display, button.game-ticket-scorer-trigger, .game-ticket-order-controls button",
      );
      if (!interactive || (interactive instanceof HTMLButtonElement && interactive.disabled)) return;

      markGameLoginPromptSeen();
      setLoginPromptOpen(true);
    },
    [showLoginPrompt],
  );

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
      <GameLoginPromptModal open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} />
      {showActions ? (
        <div className="game-ticket-actions">
          <div className="game-ticket-actions-share">
            {canNativeShare ? (
              <button
                type="button"
                disabled={sharing}
                onClick={() => void run("share")}
                aria-label={sharing ? "Generando imagen" : "Compartir"}
                title="Compartir"
              >
                <Share2 size={16} aria-hidden />
                <span className="game-ticket-action-label">{sharing ? "Generando…" : "Compartir"}</span>
              </button>
            ) : null}
            <button
              type="button"
              disabled={sharing}
              onClick={() => void run("x")}
              aria-label={sharing ? "Generando imagen" : "Compartir en X"}
              title="Compartir en X"
            >
              <span aria-hidden>X</span>
              <span className="game-ticket-action-label">{sharing ? "Generando…" : "Compartir en X"}</span>
            </button>
            <button
              type="button"
              disabled={sharing}
              onClick={() => void run("download")}
              aria-label={sharing ? "Generando imagen" : "Descargar imagen"}
              title="Descargar imagen"
            >
              <Download size={16} aria-hidden />
              <span className="game-ticket-action-label">{sharing ? "Generando…" : "Descargar imagen"}</span>
            </button>
          </div>
          {canSave || canEdit ? (
            <div className="game-ticket-actions-edit">
              {canSave ? (
                <button
                  type="button"
                  className="game-ticket-action--primary"
                  disabled={saveDisabled}
                  onClick={() => onSave?.()}
                  aria-label="Guardar"
                  title="Guardar"
                >
                  <Save size={16} aria-hidden />
                  <span className="game-ticket-action-label">Guardar</span>
                </button>
              ) : null}
              {canEdit ? (
                <button
                  type="button"
                  disabled={isEditing}
                  onClick={() => onEdit?.()}
                  aria-label="Editar"
                  title="Editar"
                >
                  <Pencil size={16} aria-hidden />
                  <span className="game-ticket-action-label">Editar</span>
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      <div ref={ticketRef} className="game-ticket-wrap" onClickCapture={handleTicketInteract}>
        <div className={`game-ticket game-ticket--${kind}`}>
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
            <span className="game-ticket-subheader-meta">
              {typeof points === "number" ? <b className="game-ticket-points">{points} pts</b> : null}
              {hint ? <span>{hint}</span> : null}
            </span>
          </div>
          {children}
          <footer className="game-ticket-footer">
            <span suppressHydrationWarning>Generado en {footerUrl}</span>
            <span className="game-ticket-footer-user">
              <strong>{creatorHandle.startsWith("@") ? creatorHandle : `@${creatorHandle}`}</strong>
            </span>
            <span>Acierta y comparte ↗</span>
          </footer>
        </div>
        {receipt}
      </div>
    </section>
  );
}

/**
 * Nombre de equipo con variante corta: en pantallas pequeñas se muestra el
 * nombre corto para que el boleto quepa; en la exportación a imagen se fuerza
 * siempre el nombre completo vía `.game-ticket--capture`.
 */
function TicketTeamName({ team }: { team: Team }) {
  const short = team.shortName || team.name;
  return (
    <>
      <span className="game-ticket-team-name game-ticket-team-name--full">{team.name}</span>
      <span className="game-ticket-team-name game-ticket-team-name--short">{short}</span>
    </>
  );
}

function teamForMatch(match: Match, side: "home" | "away", teamsById: Map<string, Team>): Team {
  const teamId = side === "home" ? match.homeTeamId : match.awayTeamId;
  const fallbackName = side === "home" ? match.homeTeam : match.awayTeam;
  return teamsById.get(teamId) ?? {
    id: teamId,
    name: fallbackName,
    shortName: fallbackName,
    city: "",
    stadium: "",
    coach: "",
    founded: 0,
    crestInitials: fallbackName.slice(0, 3).toUpperCase(),
    colors: [],
    position: 0,
    form: [],
    stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  };
}

function pickMarkClasses(
  isSelected: boolean,
  actual: PredictionOutcome | GoalsPick | null | undefined,
  value: PredictionOutcome | GoalsPick,
  baseClass: string,
): string {
  const classes = [baseClass];
  if (actual == null) return classes.join(" ");
  if (isSelected) {
    classes.push(actual === value ? "game-ticket-pick--hit" : "game-ticket-pick--miss");
  } else if (actual === value) {
    classes.push("game-ticket-pick--actual");
  }
  return classes.join(" ");
}

function outcomeMark(
  outcome: PredictionOutcome,
  selected: PredictionOutcome | undefined,
  options?: { actual?: PredictionOutcome | null; disabled?: boolean; onPick?: (outcome: PredictionOutcome) => void },
) {
  const actual = options?.actual;
  const isSelected = selected === outcome;
  const showUserMark = isSelected;
  const showActualMark = actual === outcome && selected !== outcome;
  return (
    <button
      type="button"
      className={pickMarkClasses(isSelected, actual, outcome, "game-ticket-pick")}
      key={outcome}
      disabled={options?.disabled}
      onClick={() => options?.onPick?.(outcome)}
      aria-pressed={isSelected}
    >
      <span>{outcome}</span>
      {showUserMark ? <b aria-label={`Marcado ${outcome}`}>X</b> : null}
      {showActualMark ? <b aria-label={`Resultado correcto ${outcome}`}>X</b> : null}
    </button>
  );
}

function scoreMark(
  option: GoalsPick,
  selected: GoalsPick | undefined,
  options?: { actual?: GoalsPick; disabled?: boolean; onPick?: (option: GoalsPick) => void },
) {
  const actual = options?.actual;
  const isSelected = selected === option;
  const showUserMark = isSelected;
  const showActualMark = actual === option && selected !== option;
  return (
    <button
      type="button"
      className={pickMarkClasses(isSelected, actual, option, "game-ticket-score-pick")}
      key={String(option)}
      disabled={options?.disabled}
      onClick={() => options?.onPick?.(option)}
      aria-pressed={isSelected}
    >
      <span>{option}</span>
      {showUserMark ? <b aria-label={`Marcado ${option}`}>X</b> : null}
      {showActualMark ? <b aria-label={`Resultado correcto ${option}`}>X</b> : null}
    </button>
  );
}

function formatScorerLabel(value: string): string {
  if (!value || value === "nadie") return "Nadie";
  return value;
}

function TicketScorerPicker({
  value,
  squad,
  disabled,
  readOnly,
  isCorrect,
  onChange,
}: {
  value: string;
  squad: SquadPlayer[];
  disabled?: boolean;
  readOnly?: boolean;
  isCorrect?: boolean;
  onChange: (value: string) => void;
}) {
  const searchId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const displayValue = formatScorerLabel(value);
  const selectedPlayer = useMemo(
    () => (value && value !== "nadie" ? resolveSquadPlayerByName(squad, value) : undefined),
    [squad, value],
  );

  const filteredPlayers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const players = squad
      .filter((player) => player.posicion !== "Portero")
      .sort((a, b) => {
        if (b.goles !== a.goles) return b.goles - a.goles;
        if (b.asistencias !== a.asistencias) return b.asistencias - a.asistencias;
        return getPlayerDisplayName(a).localeCompare(getPlayerDisplayName(b), "es");
      });
    if (!normalized) return players;
    return players.filter((player) => {
      const label = getPlayerDisplayName(player).toLowerCase();
      const dorsal = String(player.dorsal);
      return label.includes(normalized) || dorsal.includes(normalized) || player.posicion.toLowerCase().includes(normalized);
    });
  }, [query, squad]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  const valueClass = [
    "game-ticket-scorer-value",
    isCorrect === true ? "game-ticket-scorer-value--hit" : "",
    isCorrect === false ? "game-ticket-scorer-value--miss" : "",
    !displayValue || displayValue === "Nadie" ? "game-ticket-scorer-value--empty" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className="game-ticket-scorer">
        <span>Goleador</span>
        <div className="game-ticket-scorer-field">
          <button
            type="button"
            className={`${valueClass} game-ticket-scorer-display`}
            aria-live="polite"
            aria-haspopup="dialog"
            aria-expanded={open}
            disabled={readOnly || disabled}
            onClick={() => {
              if (!readOnly && !disabled) setOpen(true);
            }}
          >
            {displayValue || "—"}
          </button>
          {!readOnly && !disabled ? (
            <button
              type="button"
              className="game-ticket-scorer-trigger"
              data-ticket-export-hidden="true"
              onClick={() => setOpen(true)}
            >
              Elegir
            </button>
          ) : null}
        </div>
      </div>

      <Modal
        open={open}
        title="Elegir goleador"
        onClose={() => {
          setOpen(false);
          setQuery("");
        }}
        variant="ticket"
      >
        <div className="ticket-scorer-picker">
          <label className="ticket-scorer-picker-search-wrap" htmlFor={searchId}>
            <Search size={16} aria-hidden />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, dorsal o posición…"
              className="ticket-scorer-picker-search"
              autoFocus
            />
          </label>

          <ul className="ticket-scorer-picker-list" role="listbox" aria-label="Jugadores de tu equipo">
            <li>
              <button
                type="button"
                role="option"
                aria-selected={value === "nadie"}
                className={`ticket-scorer-picker-item${value === "nadie" ? " ticket-scorer-picker-item--selected" : ""}`}
                onClick={() => pick("nadie")}
              >
                <span className="ticket-scorer-picker-avatar ticket-scorer-picker-avatar--nadie" aria-hidden>
                  —
                </span>
                <span className="ticket-scorer-picker-info">
                  <strong>Nadie</strong>
                  <span className="ticket-scorer-picker-meta">Sin goleador de tu equipo</span>
                </span>
              </button>
            </li>

            {filteredPlayers.map((player) => {
              const label = scorerLabelForPlayer(player);
              const isSelected = value === label;
              return (
                <li key={player.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`ticket-scorer-picker-item${isSelected ? " ticket-scorer-picker-item--selected" : ""}`}
                    onClick={() => pick(label)}
                  >
                    <span className="ticket-scorer-picker-avatar" aria-hidden>
                      <PlayerAvatar
                        player={player}
                        bare
                        placeholderTone="light"
                        className="h-full w-full rounded-full border-2 border-[#1c3f6e]/20"
                        imageClassName="object-cover object-top"
                      />
                    </span>
                    <span className="ticket-scorer-picker-info">
                      <strong>{getPlayerDisplayName(player)}</strong>
                      <span className="ticket-scorer-picker-meta">
                        {player.posicion}
                        {player.dorsal > 0 ? ` · #${player.dorsal}` : ""}
                      </span>
                      <span className="ticket-scorer-picker-stats">
                        <span>
                          <b>{player.partidos}</b> PJ
                        </span>
                        <span>
                          <b>{player.goles}</b> G
                        </span>
                        <span>
                          <b>{player.asistencias}</b> A
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {filteredPlayers.length === 0 ? (
            <p className="ticket-scorer-picker-empty">No hay jugadores que coincidan con «{query}».</p>
          ) : null}

          {selectedPlayer ? (
            <p className="ticket-scorer-picker-current">
              Seleccionado: <strong>{getPlayerDisplayName(selectedPlayer)}</strong>
            </p>
          ) : value === "nadie" ? (
            <p className="ticket-scorer-picker-current">
              Seleccionado: <strong>Nadie</strong>
            </p>
          ) : null}
        </div>
      </Modal>
    </>
  );
}

function formatTicketDate(matches: Match[]): string {
  const firstDate = matches.map((match) => new Date(match.date)).find((date) => !Number.isNaN(date.getTime()));
  if (!firstDate) return "";
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(firstDate);
}

function normalizeScorerValue(value: unknown): string {
  if (typeof value === "string") return value === "[object Object]" ? "" : value;
  if (!value || typeof value !== "object") return "";
  const candidate = value as Record<string, unknown>;
  for (const key of ["label", "value", "displayName", "name"]) {
    if (typeof candidate[key] === "string") return candidate[key];
  }
  return "";
}

type MatchTicketProps = {
  matches: Match[];
  teams: Team[];
  round: number;
  seasonLabel: string;
  competitionLabel: string;
  creatorHandle?: string;
  points?: number;
};

export function QuinielaTicket({
  matches,
  teams,
  predictions,
  round,
  seasonLabel,
  competitionLabel,
  creatorHandle,
  points,
  readOnly,
  onChange,
  scorerCorrectByMatch,
  savedAt,
  showActions = true,
  canSave,
  canEdit,
  onSave,
  onEdit,
  saveDisabled,
  isEditing,
  showLoginPrompt,
  supportedTeamId = RAI_TEAM_ID,
  featuredSquad,
}: MatchTicketProps & {
  predictions: Record<string, Prediction>;
  readOnly?: boolean;
  onChange?: (prediction: Prediction) => void;
  scorerCorrectByMatch?: Record<string, boolean | undefined>;
  savedAt?: string;
  showActions?: boolean;
  canSave?: boolean;
  canEdit?: boolean;
  onSave?: () => void;
  onEdit?: () => void;
  saveDisabled?: boolean;
  isEditing?: boolean;
  showLoginPrompt?: boolean;
  supportedTeamId?: string;
  featuredSquad?: SquadPlayer[];
}) {
  const teamsById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const { squad: avilesSquad } = useSquadPlayers("masculino");
  const squad = featuredSquad ?? avilesSquad;
  const date = formatTicketDate(matches);
  const update = (match: Match, current: Prediction | undefined, patch: Partial<Prediction>) => {
    if (readOnly || !onChange) return;
    const next: Prediction = {
      matchId: match.id,
      matchday: match.matchday,
      outcome: current?.outcome,
      goalsHome: current?.goalsHome,
      goalsAway: current?.goalsAway,
      scorer: normalizeScorerValue(current?.scorer) || undefined,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    if (isFeaturedTeamMatch(match, supportedTeamId)) {
      const teamGoals = match.homeTeamId === supportedTeamId
        ? next.goalsHome
        : next.goalsAway;
      if (teamGoals === 0) next.scorer = "nadie";
      if (teamGoals !== undefined && teamGoals !== 0 && next.scorer === "nadie") next.scorer = undefined;
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
      creatorHandle={creatorHandle}
      points={points}
      showActions={showActions}
      canSave={canSave}
      canEdit={canEdit}
      onSave={onSave}
      onEdit={onEdit}
      saveDisabled={saveDisabled}
      isEditing={isEditing}
      showLoginPrompt={showLoginPrompt}
      receipt={
        <QuinielaReceipt
          matches={matches}
          predictions={predictions}
          round={round}
          competitionLabel={competitionLabel}
          creatorHandle={creatorHandle}
          savedAt={savedAt}
          points={points}
        />
      }
    >
      <ol className="game-ticket-list">
        {matches.map((match, index) => {
          const prediction = predictions[match.id];
          const scorerValue = normalizeScorerValue(prediction?.scorer);
          const featuredMatch = isFeaturedTeamMatch(match, supportedTeamId);
          const derivedOutcome = featuredMatch
            ? outcomeFromGoalsPicks(prediction?.goalsHome, prediction?.goalsAway)
            : null;
          const selectedOutcome = derivedOutcome ?? prediction?.outcome;
          const officialOutcome = actualOutcome(match);
          const officialHome = match.status === "finished" && match.homeScore !== undefined
            ? (match.homeScore >= 3 ? "M" : match.homeScore) as GoalsPick
            : undefined;
          const officialAway = match.status === "finished" && match.awayScore !== undefined
            ? (match.awayScore >= 3 ? "M" : match.awayScore) as GoalsPick
            : undefined;
          const teamGoals = match.homeTeamId === supportedTeamId
            ? prediction?.goalsHome
            : prediction?.goalsAway;
          return (
            <li className={`game-ticket-match-row${featuredMatch ? " game-ticket-match-row--featured" : ""}`} key={match.id}>
              <span className="game-ticket-number">{index + 1}</span>
              <span className="game-ticket-teams">
                <span>
                  <TicketCrest team={teamForMatch(match, "home", teamsById)} />
                  <TicketTeamName team={teamForMatch(match, "home", teamsById)} />
                </span>
                <i>–</i>
                <span>
                  <TicketCrest team={teamForMatch(match, "away", teamsById)} />
                  <TicketTeamName team={teamForMatch(match, "away", teamsById)} />
                </span>
              </span>
              <TicketMatchPreview match={match} />
              <span className="game-ticket-picks">
                {(["1", "X", "2"] as PredictionOutcome[]).map((outcome) =>
                  outcomeMark(outcome, selectedOutcome, {
                    actual: officialOutcome,
                    disabled: readOnly || derivedOutcome !== null,
                    onPick: (picked) => update(match, prediction, { outcome: picked }),
                  }),
                )}
              </span>
              {featuredMatch ? (
                <div className="game-ticket-featured">
                  <div className="game-ticket-featured-score">
                    <span>
                      <TicketTeamName team={teamForMatch(match, "home", teamsById)} />
                    </span>
                    <div>
                      {([0, 1, 2, "M"] as GoalsPick[]).map((option) =>
                        scoreMark(option, prediction?.goalsHome, {
                          actual: officialHome,
                          disabled: readOnly,
                          onPick: (picked) => update(match, prediction, { goalsHome: picked }),
                        }),
                      )}
                    </div>
                  </div>
                  <div className="game-ticket-featured-score">
                    <span>
                      <TicketTeamName team={teamForMatch(match, "away", teamsById)} />
                    </span>
                    <div>
                      {([0, 1, 2, "M"] as GoalsPick[]).map((option) =>
                        scoreMark(option, prediction?.goalsAway, {
                          actual: officialAway,
                          disabled: readOnly,
                          onPick: (picked) => update(match, prediction, { goalsAway: picked }),
                        }),
                      )}
                    </div>
                  </div>
                  <TicketScorerPicker
                    value={scorerValue}
                    squad={squad}
                    disabled={readOnly || teamGoals === 0}
                    readOnly={readOnly}
                    isCorrect={
                      match.status === "finished" && scorerValue
                        ? scorerCorrectByMatch?.[match.id]
                        : undefined
                    }
                    onChange={(next) =>
                      update(match, prediction, {
                        scorer: next.toLocaleLowerCase("es") === "nadie" ? "nadie" : next || undefined,
                      })
                    }
                  />
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
  creatorHandle,
  points,
  readOnly,
  onChange,
  savedAt,
  showActions = true,
  canSave,
  canEdit,
  onSave,
  onEdit,
  saveDisabled,
  isEditing,
  showLoginPrompt,
}: MatchTicketProps & {
  predictions: Record<string, QuinigolPrediction>;
  readOnly?: boolean;
  onChange?: (prediction: QuinigolPrediction) => void;
  savedAt?: string;
  showActions?: boolean;
  canSave?: boolean;
  canEdit?: boolean;
  onSave?: () => void;
  onEdit?: () => void;
  saveDisabled?: boolean;
  isEditing?: boolean;
  showLoginPrompt?: boolean;
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
      creatorHandle={creatorHandle}
      points={points}
      showActions={showActions}
      canSave={canSave}
      canEdit={canEdit}
      onSave={onSave}
      onEdit={onEdit}
      saveDisabled={saveDisabled}
      isEditing={isEditing}
      showLoginPrompt={showLoginPrompt}
      receipt={
        <QuinigolReceipt
          matches={matches}
          predictions={predictions}
          round={round}
          competitionLabel={competitionLabel}
          creatorHandle={creatorHandle}
          savedAt={savedAt}
          points={points}
        />
      }
    >
      <ol className="game-ticket-list">
        {matches.map((match, index) => {
          const prediction = predictions[match.id];
          const officialHome = match.status === "finished" && match.homeScore !== undefined
            ? (match.homeScore >= 3 ? "M" : match.homeScore) as GoalsPick
            : undefined;
          const officialAway = match.status === "finished" && match.awayScore !== undefined
            ? (match.awayScore >= 3 ? "M" : match.awayScore) as GoalsPick
            : undefined;
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
                <span><TicketCrest team={teamForMatch(match, "home", teamsById)} /><TicketTeamName team={teamForMatch(match, "home", teamsById)} /></span>
                <i>–</i>
                <span><TicketCrest team={teamForMatch(match, "away", teamsById)} /><TicketTeamName team={teamForMatch(match, "away", teamsById)} /></span>
              </span>
              <TicketMatchPreview match={match} />
              <span className="game-ticket-score">
                <span>
                  {scoreOptions.map((option) =>
                    scoreMark(option, prediction?.goalsHome, {
                      actual: officialHome,
                      disabled: readOnly,
                      onPick: (picked) => update({ goalsHome: picked }),
                    }),
                  )}
                </span>
                <i>–</i>
                <span>
                  {scoreOptions.map((option) =>
                    scoreMark(option, prediction?.goalsAway, {
                      actual: officialAway,
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

function ReceiptCreatorHandle({ creatorHandle }: { creatorHandle: string }) {
  return (
    <p className="game-ticket-receipt-handle">
      <span>{creatorHandle}</span>
    </p>
  );
}

function TicketCrest({ team }: { team: Team }) {
  const crest = getTeamCrestById(team.id, team.crestInitials);
  if (isTeamCrestUrl(crest)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="game-ticket-crest" src={crest} alt="" />;
  }
  return <span className="game-ticket-crest-fallback">{crest}</span>;
}

function StandingDiffBadge({
  diff,
  teamLabel,
}: {
  diff: number;
  teamLabel: string;
}) {
  if (diff === 0) {
    return (
      <b
        className="game-ticket-standing-diff-inline game-ticket-standing-diff--exact"
        title="Posición exacta"
        aria-label="Posición exacta"
      >
        =
      </b>
    );
  }

  return (
    <b
      className={`game-ticket-standing-diff-inline ${
        diff < 0 ? "game-ticket-standing-diff--up" : "game-ticket-standing-diff--down"
      }`}
      title={`${teamLabel} va ${Math.abs(diff)} ${Math.abs(diff) === 1 ? "puesto" : "puestos"} ${
        diff < 0 ? "por encima" : "por debajo"
      } de tu predicción`}
      aria-label={`Fallo de ${Math.abs(diff)} ${Math.abs(diff) === 1 ? "posición" : "posiciones"} ${
        diff < 0 ? "hacia arriba" : "hacia abajo"
      }`}
    >
      <i aria-hidden>{diff < 0 ? "▲" : "▼"}</i>
      {Math.abs(diff)}
    </b>
  );
}

export function ClasificacionTicket({
  teams,
  predictions,
  zones,
  seasonLabel,
  competitionLabel,
  creatorHandle,
  points,
  readOnly,
  onReorder,
  savedAt,
  actualPositions,
  showActions = true,
  canSave,
  canEdit,
  onSave,
  onEdit,
  saveDisabled,
  isEditing,
  showLoginPrompt,
}: {
  teams: Team[];
  predictions: Record<string, ClasificacionPrediction>;
  zones: CompetitionZoneRule[];
  seasonLabel: string;
  competitionLabel: string;
  creatorHandle?: string;
  points?: number;
  readOnly?: boolean;
  onReorder?: (teamIds: string[]) => void;
  savedAt?: string;
  actualPositions?: Map<string, number>;
  showActions?: boolean;
  canSave?: boolean;
  canEdit?: boolean;
  onSave?: () => void;
  onEdit?: () => void;
  saveDisabled?: boolean;
  isEditing?: boolean;
  showLoginPrompt?: boolean;
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

  const showCompare = actualPositions !== undefined && actualPositions.size > 0;
  const teamsByActualPosition = useMemo(() => {
    const map = new Map<number, Team>();
    if (!actualPositions) return map;
    for (const team of teams) {
      const actualPosition = actualPositions.get(team.id);
      if (actualPosition !== undefined) map.set(actualPosition, team);
    }
    return map;
  }, [actualPositions, teams]);

  return (
    <TicketFrame
      kind="clasificacion"
      competitionLabel={competitionLabel}
      seasonLabel={seasonLabel}
      contextLabel="Clasificación final"
      title={showCompare ? "Tu predicción" : "El Oráculo · clasificación final"}
      hint={readOnly ? "Pronóstico cerrado" : "Usa las flechas para ordenar"}
      fileName={`mi-oraculo-${seasonLabel.replaceAll("/", "-")}.png`}
      shareText={`Mi Oráculo para la clasificación final de la temporada ${seasonLabel} #RealAviles`}
      creatorHandle={creatorHandle}
      points={points}
      showActions={showActions}
      canSave={canSave}
      canEdit={canEdit}
      onSave={onSave}
      onEdit={onEdit}
      saveDisabled={saveDisabled}
      isEditing={isEditing}
      showLoginPrompt={showLoginPrompt}
      receipt={
        <ClasificacionReceipt
          teams={teams}
          predictions={predictions}
          seasonLabel={seasonLabel}
          competitionLabel={competitionLabel}
          creatorHandle={creatorHandle}
          savedAt={savedAt}
          points={points}
        />
      }
    >
      {showCompare ? (
        <div className="game-ticket-standings-head" aria-hidden>
          <span>Tu predicción</span>
          <span>Clasificación real</span>
        </div>
      ) : null}
      <ol className="game-ticket-list game-ticket-standings">
        {orderedTeams.map((team, index) => {
          const position = index + 1;
          const zone = positionZones.get(position);
          const actual = showCompare ? actualPositions?.get(team.id) : undefined;
          const diff = actual !== undefined ? getPositionDiff(position, actual) : undefined;
          const teamPoints = actual !== undefined ? scoreClasificacionPosition(position, actual) : undefined;
          const actualTeam = showCompare ? teamsByActualPosition.get(position) : undefined;
          return (
            <li
              className={`game-ticket-standing-row${showCompare ? " game-ticket-standing-row--compare" : ""}`}
              key={team.id}
              style={zone ? { borderLeftColor: zone.color, backgroundColor: `${zone.color}12` } : undefined}
            >
              <span className="game-ticket-number">{position}</span>
              <TicketCrest team={team} />
              <strong>
                <TicketTeamName team={team} />
                {showCompare && diff !== undefined ? (
                  <StandingDiffBadge diff={diff} teamLabel={team.shortName || team.name} />
                ) : null}
              </strong>
              {showCompare ? (
                <span
                  className="game-ticket-standing-actual"
                  title={actualTeam ? `${position}º real: ${actualTeam.name}` : undefined}
                >
                  {actualTeam ? <TicketTeamName team={actualTeam} /> : "—"}
                </span>
              ) : null}
              {showCompare && teamPoints !== undefined ? (
                <b className="game-ticket-standing-points" title={`Puntos por ${team.shortName || team.name}`}>
                  {teamPoints}
                  <i>pts</i>
                </b>
              ) : null}
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
