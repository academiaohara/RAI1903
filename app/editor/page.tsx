import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";

export default function EditorHomePage() {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="CMS"
        title="Editor RAI1903"
        description="Gestiona temporadas, noticias y jugadores publicados en Supabase. El sitio sigue mostrando datos mock que no estén sustituidos en la base de datos."
      />
      <Card title="Antes de usar el editor">
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-700">
          <li>
            Ejecuta el SQL de <code className="text-[#214C9B]">supabase/migrations/20250531120000_quiniela_profiles_cms.sql</code>{" "}
            en el SQL Editor de Supabase.
          </li>
          <li>
            Inicia sesión con la cuenta cuyo email es <strong>rai1903fan@gmail.com</strong> (o la que tenga rol{" "}
            <code>editor</code> en <code>profiles</code>).
          </li>
          <li>
            Las quinielas de usuarios logueados se guardan en <code>quiniela_predictions</code> y{" "}
            <code>quiniela_saved_rounds</code>.
          </li>
        </ol>
      </Card>
    </div>
  );
}
