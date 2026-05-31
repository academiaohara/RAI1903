"use client";

import Image from "next/image";
import { findSquadPlayerByName } from "@/lib/squad-lineup";
import { getSquadPlayers } from "@/lib/squad-data";
import { getPlayerFullName, getPlayerInitials } from "@/lib/squad-utils";
import type { PrimerEquipoGender } from "@/types";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function MatchEventPlayerAvatar({
  playerName,
  gender,
  lookupSquad,
}: {
  playerName: string;
  gender: PrimerEquipoGender;
  lookupSquad: boolean;
}) {
  const squad = lookupSquad ? getSquadPlayers(gender) : [];
  const squadPlayer = lookupSquad ? findSquadPlayerByName(squad, playerName) : undefined;
  const foto = squadPlayer?.foto;
  const initials = squadPlayer ? getPlayerInitials(squadPlayer) : initialsFromName(playerName);
  const alt = squadPlayer ? getPlayerFullName(squadPlayer) : playerName;

  return (
    <span className="relative inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-200">
      {foto ? (
        <Image src={foto} alt={alt} fill className="object-cover" sizes="36px" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-600">{initials}</span>
      )}
    </span>
  );
}
