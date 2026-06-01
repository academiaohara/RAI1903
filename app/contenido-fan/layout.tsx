import { ContenidoFanContextBar } from "@/components/contenido-fan/ContenidoFanContextBar";

export default function ContenidoFanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <ContenidoFanContextBar />
      {children}
    </div>
  );
}
