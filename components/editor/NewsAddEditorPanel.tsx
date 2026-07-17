"use client";

import { useState } from "react";
import { EditorPanelFrame } from "@/components/editor/EditorPanelFrame";
import { NewsEditorForm } from "@/components/editor/NewsEditorForm";
import { dispatchNewsChanged } from "@/lib/cms/news-events";
import { createNewsId, insertNewsItem } from "@/lib/cms/news";
import type { NewsChannel, NewsItem } from "@/types";

type NewsAddEditorPanelProps = {
  defaultChannel: NewsChannel;
  onClose: () => void;
};

export function NewsAddEditorPanel({ defaultChannel, onClose }: NewsAddEditorPanelProps) {
  const [newsId] = useState(createNewsId);

  const channelLabel = defaultChannel === "club" ? "Club" : "Prensa";

  return (
    <EditorPanelFrame
      title="Nueva noticia"
      subtitle={channelLabel}
      onClose={onClose}
      size="large"
    >
      <p className="mb-4 text-xs leading-relaxed text-slate-600">
        Pega la URL del comunicado o artículo y pulsa <strong>Obtener datos</strong> para rellenar título y fecha.
        Revisa el canal ({channelLabel}) antes de guardar.
      </p>
      <NewsEditorForm
        embedded
        heading="Nueva noticia"
        newsId={newsId}
        defaultChannel={defaultChannel}
        onCancel={onClose}
        onSave={async (item: NewsItem) => {
          const result = await insertNewsItem(item);
          if (result.ok) {
            dispatchNewsChanged();
            onClose();
          }
          return result;
        }}
      />
    </EditorPanelFrame>
  );
}
