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

  return (
    <Modal open={open} title={stadium.nombre} onClose={onClose}>
      <div className="space-y-5">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={stadium.imagen} alt={stadium.nombre} fill className="object-cover" sizes="(max-width: 768px) 100vw, 720px" />
        </div>

        <p className="text-sm font-medium leading-relaxed text-slate-600">
          Estadio municipal de {stadium.ciudad}, sede del primer equipo. Inaugurado en {stadium.inaugurado}, con capacidad para{" "}
          {stadium.capacidad.toLocaleString("es-ES")} espectadores y {stadium.superficie.toLowerCase()}.
        </p>

        <dl className="grid gap-3 sm:grid-cols-2">
          <InfoRow icon={MapPin} label="Direccion" value={`${stadium.direccion}, ${stadium.ciudad}`} />
          <InfoRow icon={Users} label="Capacidad" value={`${stadium.capacidad.toLocaleString("es-ES")} espectadores`} />
          <InfoRow icon={Building2} label="Superficie" value={stadium.superficie} />
          <InfoRow icon={Building2} label="Inauguracion" value={String(stadium.inaugurado)} />
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
