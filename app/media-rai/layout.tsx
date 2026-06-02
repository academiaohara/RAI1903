import { MediaRaiContextBar } from "@/components/media-rai/MediaRaiContextBar";

export default function MediaRaiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <MediaRaiContextBar />
      {children}
    </div>
  );
}
