import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Documento, DocumentoResumo } from "../schemas/models.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPLIANCE_ROOT = resolve(__dirname, "..", "..", "..");

interface RawDocumentoFile {
  norma: {
    tipo: string;
    numero: number;
    data: string;
    ementa: string;
    publicacao_dou?: string;
    entrada_vigor?: string;
  };
  estrutura: { capitulos: any[] };
}

const DOC_PATHS = [
  { id: "bcb-rc-16", dir: "bcb-rc-16-28-11-2025", file: "rc16-estrutura-detalhada.json" },
  { id: "bcb-rc-17", dir: "bcb-rc-17-28-11-2025", file: "rc17-estrutura-detalhada.json" },
];

class DocumentoService {
  private documentos: Map<string, Documento> = new Map();

  carregar(): void {
    for (const doc of DOC_PATHS) {
      try {
        const path = resolve(COMPLIANCE_ROOT, doc.dir, doc.file);
        const raw = JSON.parse(readFileSync(path, "utf-8")) as RawDocumentoFile;

        this.documentos.set(doc.id, {
          id: doc.id,
          titulo: `${raw.norma.tipo} nº ${raw.norma.numero}/${raw.norma.data.slice(0, 4)}`,
          versao: "1.0",
          data_publicacao: raw.norma.publicacao_dou ?? raw.norma.data,
          data_vigencia: raw.norma.entrada_vigor ?? raw.norma.data,
          ementa: raw.norma.ementa,
          norma: raw.norma,
          estrutura: raw.estrutura,
        });
      } catch (err) {
        console.error(`Erro ao carregar documento ${doc.id}:`, err);
      }
    }
  }

  listar(dominio?: string, status?: string): DocumentoResumo[] {
    const resultados: DocumentoResumo[] = [];
    for (const doc of this.documentos.values()) {
      if (dominio && !doc.id.includes(dominio)) continue;
      if (status && status === "vigente" && new Date(doc.data_vigencia) > new Date()) continue;
      resultados.push({
        id: doc.id,
        titulo: doc.titulo,
        versao: doc.versao,
        data_vigencia: doc.data_vigencia,
        ementa: doc.ementa,
      });
    }
    return resultados;
  }

  obter(id: string): Documento | undefined {
    return this.documentos.get(id);
  }
}

export const documentoSvc = new DocumentoService();
