import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";
import type { Regra, RegraResumo, RegraDetalhada, ResultadoBusca, Artigo } from "../schemas/models.js";
import { documentoSvc } from "./documento-service.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPLIANCE_ROOT = resolve(__dirname, "..", "..", "..");

const YAML_DIRS = [
  { prefix: "bcb-rc-16", path: "bcb-rc-16-28-11-2025/sbvr" },
  { prefix: "bcb-rc-17", path: "bcb-rc-17-28-11-2025/sbvr" },
];

const MODALIDADE_MAP: Record<string, string> = {
  obrigado: "obrigacao",
  proibido: "proibicao",
  permitido: "permissao",
};

function extrairAcao(regraSbvr: string): string {
  const m = regraSbvr.match(/^É\s+(obrigatorio|proibido|permitido)\s+(?:que\s+)?(.+)$/i);
  if (m) return m[2].trim();
  return "cumprimento_da_regra";
}

function calcularRelevancia(regra: Regra, query: string): number {
  const q = query.toLowerCase();
  let score = 0;
  if (regra.regra_sbvr.toLowerCase().includes(q)) score += 10;
  if (regra.texto_original.toLowerCase().includes(q)) score += 5;
  for (const kw of regra.keywords) {
    if (kw.toLowerCase().includes(q)) score += 3;
  }
  for (const vc of regra.vocabulario_conceitos) {
    if (vc.termo.toLowerCase().includes(q) || vc.conceito.toLowerCase().includes(q)) score += 2;
  }
  if (regra.artigo.toLowerCase().includes(q)) score += 1;
  return score;
}

class RegraService {
  private regras: Map<string, Regra> = new Map();

  carregar(): void {
    for (const dir of YAML_DIRS) {
      const dirPath = resolve(COMPLIANCE_ROOT, dir.path);
      try {
        const files = readdirSync(dirPath).filter((f) => f.endsWith(".yaml"));
        for (const file of files) {
          try {
            const filePath = resolve(dirPath, file);
            const raw = load(readFileSync(filePath, "utf-8")) as Record<string, unknown>;
            if (!raw || typeof raw !== "object") continue;

            const regra = raw as unknown as Regra;
            if (!regra.id) continue;
            this.regras.set(regra.id, regra);
          } catch {
            // skip individual file errors
          }
        }
      } catch (err) {
        console.error(`Erro ao ler diretório ${dir.path}:`, err);
      }
    }
  }

  listar(opts?: {
    documento_id?: string;
    tipo?: string;
    termo?: string;
  }): RegraResumo[] {
    const resultados: RegraResumo[] = [];
    for (const regra of this.regras.values()) {
      if (opts?.documento_id && !regra.id.startsWith(opts.documento_id)) continue;
      if (opts?.tipo && MODALIDADE_MAP[regra.modalidade] !== opts.tipo) continue;
      if (opts?.termo) {
        const t = opts.termo.toLowerCase();
        const matchSbvr = regra.regra_sbvr.toLowerCase().includes(t);
        const matchKw = regra.keywords.some((k) => k.toLowerCase().includes(t));
        const matchVoc = regra.vocabulario_conceitos.some(
          (v) => v.termo.toLowerCase().includes(t) || v.conceito.toLowerCase().includes(t)
        );
        if (!matchSbvr && !matchKw && !matchVoc) continue;
      }
      resultados.push({
        id: regra.id,
        artigo: regra.artigo,
        modalidade: regra.modalidade,
        regra_sbvr: regra.regra_sbvr,
        documento_id: regra.id.startsWith("bcb-rc-16") ? "bcb-rc-16" : "bcb-rc-17",
      });
    }
    return resultados;
  }

  obter(id: string): Regra | undefined {
    return this.regras.get(id);
  }

  obterDetalhada(id: string): RegraDetalhada | undefined {
    const regra = this.regras.get(id);
    if (!regra) return undefined;

    const docId = id.startsWith("bcb-rc-16") ? "bcb-rc-16" : "bcb-rc-17";
    const doc = documentoSvc.obter(docId);

    let artigoJson: Artigo | null = null;
    if (doc) {
      const artigoNum = parseInt(regra.artigo.match(/\d+/)?.[0] ?? "0", 10);
      for (const cap of doc.estrutura.capitulos) {
        for (const art of cap.artigos) {
          if (art.id === artigoNum) {
            artigoJson = art;
            break;
          }
        }
        if (artigoJson) break;
      }
    }

    return {
      ...regra,
      documento: {
        id: docId,
        titulo: doc?.titulo ?? "",
        versao: doc?.versao ?? "1.0",
        data_vigencia: doc?.data_vigencia ?? "",
        ementa: doc?.ementa ?? "",
      },
      artigo_json: artigoJson,
    };
  }

  buscar(consulta: string): ResultadoBusca[] {
    if (!consulta.trim()) return [];
    const resultados: ResultadoBusca[] = [];

    for (const regra of this.regras.values()) {
      const relevancia = calcularRelevancia(regra, consulta);
      if (relevancia > 0) {
        resultados.push({
          id: regra.id,
          relevancia,
          regra_sbvr: regra.regra_sbvr,
          artigo: regra.artigo,
          modalidade: regra.modalidade,
          documento_id: regra.id.startsWith("bcb-rc-16") ? "bcb-rc-16" : "bcb-rc-17",
        });
      }
    }

    resultados.sort((a, b) => b.relevancia - a.relevancia);
    return resultados.slice(0, 50);
  }

  extrairTaxonomia(): { atores: string[]; acoes: string[]; objetos: string[] } {
    const atores = new Set<string>();
    const acoes = new Set<string>();
    const objetos = new Set<string>();

    for (const regra of this.regras.values()) {
      if (regra.sbvr?.scd?.scope?.atores) {
        for (const a of regra.sbvr.scd.scope.atores) atores.add(a);
      }
      if (regra.keywords) {
        for (const kw of regra.keywords) {
          if (kw.includes("_")) objetos.add(kw);
        }
      }
    }

    for (const regra of this.regras.values()) {
      const acao = extrairAcao(regra.regra_sbvr);
      if (acao) acoes.add(acao);
    }

    return {
      atores: [...atores].sort(),
      acoes: [...acoes].sort().slice(0, 100),
      objetos: [...objetos].sort(),
    };
  }
}

export const regraSvc = new RegraService();
