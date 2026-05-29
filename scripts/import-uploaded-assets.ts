import { copyFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const escudosSource = join(root, "Escudos");
const competicionesSource = join(root, "Competiciones");
const escudosPublic = join(root, "public/escudos");
const competicionesPublic = join(root, "public/competiciones");

/** Maps team slug → source filename (without path) in Escudos/. */
const ESCUDO_IMPORT_MAP: Record<string, string> = {
  "real-aviles-industrial": "logo.png",
  "lugo": "LUGO.png",
  "pontevedra": "PONTEVEDRA.png",
  "zamora": "ZAMORA.png",
  "arenteiro": "ARENTEIRO.png",
  "unionistas": "UNIONISTAS.png",
  "ponferradina": "PONFERRADINA.png",
  "castilla": "REALMADRID.png",
  "tenerife": "TENERIFE.png",
  "talavera": "TALAVERA.png",
  "merida": "MERIDA.png",
  "celta-fortuna": "CELTA.png",
  "cacereno": "CACEREÑO.png",
  "guadalajara": "GUADALAJARA.png",
  "ourense": "OURENSE.png",
  "athletic-bilbao-b": "ATHLETIC.png",
  "osasuna-promesas": "OSASUNA.png",
  "eldense": "ELDENSE.png",
  "sabadell": "SABADELL.png",
  "atletico-madrileno": "ATMADRILEÑO.png",
  "villarreal-b": "VILLARREAL.png",
  "europa": "EUROPA.png",
  "cartagena": "CARTAGENA.png",
  "antequera": "ANTEQUERA.png",
  "algeciras": "ALGECIRAS.png",
  "hercules": "HERCULES.png",
  "real-murcia": "MURCIA.png",
  "alcorcon": "ALCORCON.png",
  "ibiza": "IBIZA.png",
  "teruel": "TERUEL.png",
  "gimnastic": "NASTIC.png",
  "torremolinos": "TORRMOLINOS.png",
  "betis-deportivo": "BETIS.png",
  "tarazona": "TARAZONA.png",
  "marbella": "MARBELLA.png",
  "atletico-sanluqueno": "SANLUQUEÑO.png",
  "sevilla-atletico": "SEVILLA.png",
};

const COMPETICION_IMPORT_MAP: Record<string, string> = {
  "primera-rfef": "1rfef.png",
  "copa-rey": "Copadelrey.png",
};

function resolveSource(dir: string, filename: string): string | null {
  const direct = join(dir, filename);
  if (existsSync(direct)) return direct;
  const entries = readdirSync(dir);
  const match = entries.find((entry) => entry.toLowerCase() === filename.toLowerCase());
  return match ? join(dir, match) : null;
}

function importEscudos() {
  mkdirSync(escudosPublic, { recursive: true });
  let copied = 0;

  for (const [slug, sourceName] of Object.entries(ESCUDO_IMPORT_MAP)) {
    const sourceDir = sourceName === "logo.png" ? join(root, "public") : escudosSource;
    const sourcePath = resolveSource(sourceDir, sourceName);
    if (!sourcePath) {
      console.warn(`Omitido ${slug}: no se encuentra ${sourceName}`);
      continue;
    }

    const destPath = join(escudosPublic, `${slug}.png`);
    copyFileSync(sourcePath, destPath);

    const legacyJpg = join(escudosPublic, `${slug}.jpg`);
    if (existsSync(legacyJpg)) unlinkSync(legacyJpg);

    copied += 1;
  }

  console.log(`Escudos importados: ${copied} → public/escudos/*.png`);
}

function importCompeticiones() {
  mkdirSync(competicionesPublic, { recursive: true });
  let copied = 0;

  for (const [slug, sourceName] of Object.entries(COMPETICION_IMPORT_MAP)) {
    const sourcePath = resolveSource(competicionesSource, sourceName);
    if (!sourcePath) {
      console.warn(`Omitida competicion ${slug}: no se encuentra ${sourceName}`);
      continue;
    }

    copyFileSync(sourcePath, join(competicionesPublic, `${slug}.png`));
    copied += 1;
  }

  console.log(`Logos de competicion importados: ${copied} → public/competiciones/*.png`);
}

importEscudos();
importCompeticiones();
