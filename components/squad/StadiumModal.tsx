"use client";

import Image from "next/image";
import { Building2, ExternalLink, MapPin, Users } from "lucide-react";
import type { StadiumInfo } from "@/types/squad";
import { Modal } from "@/components/Modal";

type StadiumModalProps = {
  stadium: StadiumInfo | null;
  open: boolean;
  onClose: () => void;
};

export function StadiumModal({ stadium, open, onClose }: StadiumModalProps) {
  if (!stadium) return null;

  const ubicacion = `${stadium.direccion}, ${stadium.ciudad}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ubicacion)}`;

  return (
    <Modal open={open} title={stadium.nombre} onClose={onClose}>
      <div className="space-y-5">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={stadium.imagen} alt={stadium.nombre} fill className="object-cover" sizes="(max-width: 768px) 100vw, 720px" />
        </div>

        <p className="text-sm font-medium leading-relaxed text-slate-600">
          Estadio municipal de {stadium.ciudad}, sede del primer equipo.
        </p>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <MapPin size={14} className="text-[#214C9B]" aria-hidden />
            Ubicacion
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-800">
            <span>{ubicacion}</span>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center rounded-lg p-1 text-[#214C9B] transition hover:bg-blue-100/80"
              aria-label="Ver en Google Maps"
            >
              <ExternalLink size={16} aria-hidden />
            </a>
          </p>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <InfoRow icon={Users} label="Capacidad" value={`${stadium.capacidad.toLocaleString("es-ES")} espectadores`} />
          <InfoRow icon={Building2} label="Superficie" value={stadium.superficie} />
        </dl>
      </div>
    </Modal>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <dt className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        <Icon size={14} className="text-[#214C9B]" />
        {label}
      </dt>
      <dd className="mt-2 text-sm font-bold text-slate-800">{value}</dd>
    </div>
  );
}
