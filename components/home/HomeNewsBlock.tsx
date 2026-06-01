"use client";

import { Card } from "@/components/Card";
import { HomeNewsTicker } from "@/components/home/HomeNewsTicker";
import { NewsNavButton } from "@/components/NewsNavButton";

export function HomeNewsBlock() {
  return (
    <Card
      eyebrow="Noticiero"
      title="Actualidad en movimiento"
      action={<NewsNavButton href="/noticias/club" />}
    >
      <HomeNewsTicker />
    </Card>
  );
}
