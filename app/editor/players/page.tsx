"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { createClient } from "@/lib/supabase/client";
import type { Player } from "@/types";

const SAMPLE_PAYLOAD: Player = {
  id: "nuevo-jugador",
  firstName: "Nombre",
  lastName: "Apellido",
  displayName: "Nombre Apellido",
  number: 99,
  position: "Centrocampista",
  nationality: "España",
  age: 22,
  birthDate: "2004-01-01",
  height: "1,80 m",
  preferredFoot: "Derecha",
  seasonsAtClub: 1,
  status: "nuevo fichaje",
  rating: 70,
  bio: "",
  clubHistory: [],
  stats: { appearances: 0, goals: 0, assists: 0, minutes: 0, yellowCards: 0, redCards: 0 },
};

export default function EditorPlayersPage() {
  const [seasonId, setSeasonId] = useState("2025-26");
  const [squad, setSquad] = useState<"masculino" | "femenino">("masculino");
  const [json, setJson] = useState(JSON.stringify(SAMPLE_PAYLOAD, null, 2));
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    let payload: Player;
    try {
      payload = JSON.parse(json) as Player;
    } catch {
      setMessage("JSON inválido.");
      return;
    }

    if (!payload.id) {
      setMessage("El JSON debe incluir id.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("cms_players").upsert({
      id: payload.id,
      season_id: seasonId,
      squad,
      payload,
      published: true,
      updated_at: new Date().toISOString(),
    });

    setMessage(error ? error.message : `Jugador ${payload.displayName} guardado.`);
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Editor"
        title="Jugadores"
        description="Pega o edita el JSON completo del jugador (tipo Player). Sustituye al mock si el id coincide."
      />

      <Card title="Alta / actualización">
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700">
              Temporada
              <input
                value={seasonId}
                onChange={(e) => setSeasonId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#214C9B]/25 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Plantilla
              <select
                value={squad}
                onChange={(e) => setSquad(e.target.value as "masculino" | "femenino")}
                className="mt-1 w-full rounded-xl border border-[#214C9B]/25 px-3 py-2"
              >
                <option value="masculino">masculino</option>
                <option value="femenino">femenino</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-bold text-slate-700">
            JSON (Player)
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              rows={16}
              className="mt-1 w-full font-mono text-xs rounded-xl border border-[#214C9B]/25 px-3 py-2"
            />
          </label>
          <button type="submit" className="rounded-2xl bg-[#214C9B] px-6 py-3 text-sm font-extrabold uppercase text-white">
            Guardar jugador
          </button>
        </form>
        {message ? <p className="mt-3 text-sm font-medium text-[#981915]">{message}</p> : null}
      </Card>
    </div>
  );
}
