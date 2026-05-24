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

export interface VocabularioConceito {
  termo: string;
  conceito: string;
}

export interface Ambiguidade {
  id: string;
  titulo: string;
  descricao: string;
}

export interface ScdScope {
  atores: string[];
  contexto: string[];
  papeis: string[];
}

export interface ScdCondition {
  existe: boolean;
  regras: { tipo: string; descricao: string }[];
}

export interface ScdDemand {
  modalidade?: string;
  obrigacoes?: string[];
  proibicoes?: string[];
  permissoes?: string[];
}

export interface Scd {
  scope: ScdScope;
  condition: ScdCondition;
  demand: ScdDemand;
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

export interface RegraDetalhada {
  id: string;
  referencia_normativa: {
    ato: string;
    numero: number;
    data: string;
  };
  artigo: string;
  modalidade: string;
  regra_sbvr: string;
  texto_original: string;
  keywords: string[];
  vocabulario_conceitos: VocabularioConceito[];
  ambiguidades_relacionadas: Ambiguidade[];
  documento: DocumentoResumo;
  artigo_json: {
    caput?: string;
    incisos?: { id: string; texto: string; alineas?: { id: string; texto: string }[] }[];
    paragrafos?: { id: string; texto: string }[];
  } | null;
  sbvr?: Sbvr | null;
  condicoes?: string[];
  periodo_tempo?: PeriodoTempo;
}

export interface ResultadoBusca {
  id: string;
  relevancia: number;
  regra_sbvr: string;
  artigo: string;
  modalidade: string;
  documento_id: string;
}

export type Modalidade = "obrigado" | "proibido" | "permitido";

export const MODALIDADE_LABEL: Record<string, string> = {
  obrigado: "Obrigação",
  proibido: "Proibição",
  permitido: "Permissão",
};

export const MODALIDADE_COLOR: Record<string, string> = {
  obrigado: "#22c55e",
  proibido: "#ef4444",
  permitido: "#38bdf8",
};
