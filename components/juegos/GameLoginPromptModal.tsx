"use client";

import { usePathname } from "next/navigation";
import { Modal } from "@/components/Modal";
import { TwitterLoginButton } from "@/components/auth/TwitterLoginButton";

type GameLoginPromptModalProps = {
  open: boolean;
  onClose: () => void;
};

export function GameLoginPromptModal({ open, onClose }: GameLoginPromptModalProps) {
  const pathname = usePathname();

  return (
    <Modal open={open} title="Inicia sesión" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
          Para guardar tu pronóstico y competir en el ranking necesitas iniciar sesión con tu cuenta de X.
        </p>
        <p className="text-sm text-slate-600">
          Mientras tanto puedes rellenar el boleto, pero no se guardará en la nube ni aparecerás en la clasificación
          hasta que entres.
        </p>
        <TwitterLoginButton nextPath={pathname} label="Iniciar sesión con X" />
      </div>
    </Modal>
  );
}
