import { copyFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const escudosSource = join(root, "Escudos");
const competicionesSource = join(root, "Competiciones");
const estadiosSource = join(root, "Estadios");
const escudosPublic = join(root, "public/escudos");
const competicionesPublic = join(root, "public/competiciones");
const estadioPublic = join(root, "public/estadio");

/** Maps team slug → source filename (without path) in Escudos/. */
const ESCUDO_IMPORT_MAP: Record<string, string> = {
  "real-aviles-industrial": "RealAvilesInd.png",
  "ferrol": "FERROL.png",
  "arenas": "ARENAS.png",
  "barakaldo": "BARAKALDO.png",
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

/** Maps team slug → source filename in Estadios/. Destination uses the same extension. */
const ESTADIO_IMPORT_MAP: Record<string, string> = {
  "real-aviles-industrial": "Roman_suarez_puerta.jpg",
  ferrol: "a_malata.jpg",
  lugo: "anxo_carro.webp",
  pontevedra: "pasaron.jpg",
  zamora: "ruta_de_la_plata.JPG",
  arenteiro: "espiñedo.jpg",
  unionistas: "Reina_sofia.jpg",
  ponferradina: "toralin.jpg",
  castilla: "alfredo_di_stefano.jpg",
  tenerife: "Heliodoro.webp",
  talavera: "talavera.jpg",
  merida: "jose_fouto.jpg",
  "celta-fortuna": "Estadio de Barreiro.jpg",
  cacereno: "Principe_felipe.webp",
  guadalajara: "Pedro_escartin.jpg",
  ourense: "o_couto.jpg",
  arenas: "fadura.png",
  barakaldo: "lasesarre.jpg",
  "athletic-bilbao-b": "lezama.jpg",
  "osasuna-promesas": "tajonar.jpg",
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
    const sourcePath = resolveSource(escudosSource, sourceName);
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

function extensionOf(filename: string): string {
  const match = filename.match(/\.(jpe?g|png|webp)$/i);
  return match ? match[0]!.toLowerCase() : ".jpg";
}

function importEstadios() {
  mkdirSync(estadioPublic, { recursive: true });
  let copied = 0;

  for (const [slug, sourceName] of Object.entries(ESTADIO_IMPORT_MAP)) {
    const sourcePath = resolveSource(estadiosSource, sourceName);
    if (!sourcePath) {
      console.warn(`Omitido estadio ${slug}: no se encuentra ${sourceName}`);
      continue;
    }

    const ext = extensionOf(sourceName);
    copyFileSync(sourcePath, join(estadioPublic, `${slug}${ext}`));
    copied += 1;
  }

  console.log(`Estadios importados: ${copied} → public/estadio/*`);
}

importEscudos();
importCompeticiones();
importEstadios();
