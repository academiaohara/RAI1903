"use client";

import { HomeTransfersSection } from "@/components/fichajes/HomeTransfersSection";
import { useTransfers } from "@/hooks/useTransfers";

export function HomeTransfersGate() {
  const { hasAnyCarousel, loading } = useTransfers();

  if (loading || !hasAnyCarousel()) return null;

  return <HomeTransfersSection />;
}
