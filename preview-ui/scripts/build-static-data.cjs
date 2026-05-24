const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const COMPLIANCE_ROOT = path.resolve(__dirname, "..", "..");
const OUT_DIR = path.resolve(__dirname, "..", "src", "data");

const YAML_DIRS = [
  { prefix: "bcb-rc-16", dir: "bcb-rc-16-28-11-2025/sbvr" },
  { prefix: "bcb-rc-17", dir: "bcb-rc-17-28-11-2025/sbvr" },
];

const JSON_DIRS = [
  { id: "bcb-rc-16", file: "bcb-rc-16-28-11-2025/rc16-estrutura-detalhada.json" },
  { id: "bcb-rc-17", file: "bcb-rc-17-28-11-2025/rc17-estrutura-detalhada.json" },
];

// 1. Carregar regras dos YAMLs
const regras = [];

for (const entry of YAML_DIRS) {
  const dirPath = path.resolve(COMPLIANCE_ROOT, entry.dir);
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".yaml"));

  for (const file of files) {
    try {
      const raw = yaml.load(fs.readFileSync(path.resolve(dirPath, file), "utf-8"));
      if (!raw || !raw.id) continue;

      const docId = raw.id.startsWith("bcb-rc-16") ? "bcb-rc-16" : "bcb-rc-17";

      const sbvr = raw.sbvr || null;

      regras.push({
        id: raw.id,
        documento_id: docId,
        artigo: raw.artigo || "",
        modalidade: raw.modalidade || "",
        regra_sbvr: raw.regra_sbvr || "",
        texto_original: raw.texto_original || "",
        keywords: raw.keywords || [],
        vocabulario_conceitos: raw.vocabulario_conceitos || [],
        ambiguidades_relacionadas: raw.ambiguidades_relacionadas || [],
        referencia_normativa: raw.referencia_normativa || null,
        sbvr: sbvr
          ? {
              scd: {
                scope: sbvr.scd?.scope || { atores: [], contexto: [], papeis: [] },
                condition: sbvr.scd?.condition || { existe: false, regras: [] },
                demand: sbvr.scd?.demand || {},
              },
            }
          : null,
        condicoes: raw.condicoes || [],
        periodo_tempo: raw.periodo_tempo || {
          existe: false,
          descricao: null,
          marco_inicial: null,
          prazo: null,
          data_limite: null,
        },
      });
    } catch {
      // skip individual file errors
    }
  }
}

// 2. Carregar documentos dos JSONs
const documentos = [];

for (const entry of JSON_DIRS) {
  try {
    const filePath = path.resolve(COMPLIANCE_ROOT, entry.file);
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    documentos.push({
      id: entry.id,
      titulo: `${raw.norma.tipo} nº ${raw.norma.numero}/${raw.norma.data.slice(0, 4)}`,
      versao: "1.0",
      data_publicacao: raw.norma.publicacao_dou || raw.norma.data,
      data_vigencia: raw.norma.entrada_vigor || raw.norma.data,
      ementa: raw.norma.ementa,
      norma: raw.norma,
      estrutura: raw.estrutura,
    });
  } catch (err) {
    console.error(`Erro ao carregar ${entry.file}:`, err.message);
  }
}

// 3. Escrever data.json
fs.mkdirSync(OUT_DIR, { recursive: true });
const data = { documentos, regras };

fs.writeFileSync(
  path.resolve(OUT_DIR, "regulatory-data.json"),
  JSON.stringify(data, null, 2),
  "utf-8"
);

console.log(`✔ Data gerada: ${regras.length} regras, ${documentos.length} documentos`);
console.log(`  → ${path.resolve(OUT_DIR, "regulatory-data.json")}`);
