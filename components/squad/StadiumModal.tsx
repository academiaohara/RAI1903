"use client";

import Image from "next/image";
import { Building2, MapPin, Users } from "lucide-react";
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
    <Modal
      open={open}
      title={stadium.nombre}
      titleHref={mapsUrl}
      titleLinkLabel="Ver en Google Maps"
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={stadium.imagen} alt={stadium.nombre} fill className="object-cover" sizes="(max-width: 768px) 100vw, 720px" />
        </div>

        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <MapPin size={14} className="text-[#214C9B]" aria-hidden />
            Ubicacion
          </p>
          <p className="mt-2 text-sm font-bold text-slate-800">{ubicacion}</p>
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
    <div>
      <dt className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        <Icon size={14} className="text-[#214C9B]" />
        {label}
      </dt>
      <dd className="mt-2 text-sm font-bold text-slate-800">{value}</dd>
    </div>
  );
}
