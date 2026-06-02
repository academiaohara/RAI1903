"use client";

import { HomeTransfersSection } from "@/components/fichajes/HomeTransfersSection";
import { useTransfers } from "@/hooks/useTransfers";

export function HomeTransfersGate() {
  const { loading } = useTransfers();

  if (loading) return null;

  return <HomeTransfersSection />;
}
