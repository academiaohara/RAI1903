"use client";

import type { User } from "@supabase/supabase-js";
import { Modal } from "@/components/Modal";
import { AccountDashboard, AccountPanelSkeleton } from "@/components/auth/AccountPanel";

type AccountModalProps = {
  open: boolean;
  onClose: () => void;
  user: User | null;
  ready: boolean;
  displayHandle: string;
  onHandleSaved: (handle: string) => void;
};

export function AccountModal({
  open,
  onClose,
  user,
  ready,
  displayHandle,
  onHandleSaved,
}: AccountModalProps) {
  return (
    <Modal open={open} title="Mi cuenta" onClose={onClose} size="sm">
      {!ready || !user ? (
        <AccountPanelSkeleton embedded />
      ) : (
        <AccountDashboard
          user={user}
          displayHandle={displayHandle}
          onHandleSaved={onHandleSaved}
          embedded
        />
      )}
    </Modal>
  );
}
