"use client";

import Image from "next/image";
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
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
        <Image src={stadium.imagen} alt={stadium.nombre} fill className="object-cover" sizes="(max-width: 768px) 100vw, 720px" />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Capacidad</dt>
          <dd className="mt-1 text-sm font-extrabold text-[#214C9B]">
            {stadium.capacidad.toLocaleString("es-ES")} espectadores
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Tipo de césped</dt>
          <dd className="mt-1 text-sm font-extrabold text-[#214C9B]">{stadium.superficie}</dd>
        </div>
      </dl>
    </Modal>
  );
}
