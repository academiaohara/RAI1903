"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { LineupPlayerChip } from "@/components/lineup/LineupPlayerChip";
import { useHorizontalCarousel } from "@/lib/use-horizontal-carousel";
import { useHorizontalWheelScroll } from "@/lib/use-horizontal-wheel-scroll";
import type { SquadPlayer } from "@/types/squad";

type LineupPositionCarouselProps = {
  label: string;
  players: SquadPlayer[];
  crestUrl?: string | null;
  selectedPlayerId: string | null;
  assignedIds: Set<string>;
  onSelect: (player: SquadPlayer) => void;
};

export function LineupPositionCarousel({
  label,
  players,
  crestUrl,
  selectedPlayerId,
  assignedIds,
  onSelect,
}: LineupPositionCarouselProps) {
  const { trackRef, goPrev, goNext } = useHorizontalCarousel(players.length);
  const { onWheel } = useHorizontalWheelScroll();

  if (players.length === 0) return null;

  return (
    <section className="lineup-position-carousel" aria-label={label}>
      <div className="lineup-position-carousel-header">
        <h4 className="lineup-position-carousel-title">{label}</h4>
        {players.length > 1 ? (
          <div className="lineup-position-carousel-nav">
            <button
              type="button"
              onClick={goPrev}
              className="lineup-position-carousel-btn"
              aria-label={`Anterior en ${label}`}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="lineup-position-carousel-btn"
              aria-label={`Siguiente en ${label}`}
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={trackRef}
        onWheel={onWheel}
        className="lineup-position-carousel-track no-scrollbar"
        role="list"
      >
        {players.map((player, index) => (
          <div key={player.id} className="lineup-position-carousel-slide" role="listitem">
            <LineupPlayerChip
              player={player}
              index={index}
              crestUrl={crestUrl}
              selected={selectedPlayerId === player.id}
              assigned={assignedIds.has(player.id)}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
