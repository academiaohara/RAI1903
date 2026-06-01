"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useTransferMarketDraft, type UseTransferMarketDraftResult } from "@/hooks/useTransferMarketDraft";

const TransferMarketEditContext = createContext<UseTransferMarketDraftResult | null>(null);

type TransferMarketEditProviderProps = {
  children: ReactNode;
  enabled: boolean;
};

export function TransferMarketEditProvider({ children, enabled }: TransferMarketEditProviderProps) {
  const draft = useTransferMarketDraft();

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <TransferMarketEditContext.Provider value={draft}>{children}</TransferMarketEditContext.Provider>
  );
}

export function useTransferMarketEdit(): UseTransferMarketDraftResult {
  const context = useContext(TransferMarketEditContext);
  if (!context) {
    throw new Error("useTransferMarketEdit debe usarse dentro de TransferMarketEditProvider con enabled=true");
  }
  return context;
}

export function useTransferMarketEditOptional(): UseTransferMarketDraftResult | null {
  return useContext(TransferMarketEditContext);
}
