export interface ReferenciaNormativa {
  ato: string;
  numero: number;
  data: string;
  publicacao_dou: string;
  vigencia: string;
}

export interface VocabularioConceito {
  termo: string;
  conceito: string;
}

export interface Ambiguidade {
  id: string;
  titulo: string;
  descricao: string;
}

export interface CondicaoScd {
  existe: boolean;
  regras: { tipo: string; descricao: string }[];
}

export interface DemandaScd {
  modalidade: string;
  obrigacoes?: string[];
  proibicoes?: string[];
  permissoes?: string[];
}

export interface ScopeScd {
  atores: string[];
  contexto: string[];
  papeis: string[];
}

export interface Scd {
  scope: ScopeScd;
  condition: CondicaoScd;
  demand: DemandaScd;
}

export interface Sbvr {
  scd: Scd;
}

export interface PeriodoTempo {
  existe: boolean;
  descricao: string | null;
  marco_inicial: string | null;
  prazo: string | null;
  data_limite: string | null;
}

export interface Regra {
  id: string;
  referencia_normativa: ReferenciaNormativa;
  artigo: string;
  modalidade: string;
  regra_sbvr: string;
  sbvr?: Sbvr;
  texto_original: string;
  keywords: string[];
  vocabulario_conceitos: VocabularioConceito[];
  condicoes: string[];
  periodo_tempo: PeriodoTempo;
  ambiguidades_relacionadas: Ambiguidade[];
}

export interface Artigo {
  id: number;
  rotulo: string;
  caput?: string;
  incisos?: any[];
  paragrafos?: any[];
}

export interface Capitulo {
  id: string;
  titulo: string;
  artigos: Artigo[];
}

export interface Norma {
  tipo: string;
  numero: number;
  data: string;
  ementa: string;
  publicacao_dou?: string;
  entrada_vigor?: string;
}

export interface Documento {
  id: string;
  titulo: string;
  versao: string;
  data_publicacao: string;
  data_vigencia: string;
  ementa: string;
  norma: Norma;
  estrutura: { capitulos: Capitulo[] };
}

export interface DocumentoResumo {
  id: string;
  titulo: string;
  versao: string;
  data_vigencia: string;
  ementa: string;
}

export interface RegraResumo {
  id: string;
  artigo: string;
  modalidade: string;
  regra_sbvr: string;
  documento_id: string;
}

export interface RegraDetalhada extends Regra {
  documento: DocumentoResumo;
  artigo_json: Artigo | null;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

export interface ResultadoBusca {
  id: string;
  relevancia: number;
  regra_sbvr: string;
  artigo: string;
  modalidade: string;
  documento_id: string;
}
