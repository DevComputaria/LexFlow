import { describe, it, expect, beforeEach, vi } from "vitest";

const mockYamls: Record<string, string> = {
  "bcb-rc-16-r01.yaml": `
id: bcb-rc-16-r01
artigo: Art. 1o
modalidade: obrigado
regra_sbvr: "É obrigatório que a instituição autorizada pelo BCB mantenha contrato formal com o PSP parceiro."
texto_original: "A instituição autorizada deve manter contrato formal com o PSP parceiro."
keywords: [contrato, psp, formalizacao]
vocabulario_conceitos:
  - termo: contrato formal
    conceito: Instrumento jurídico que formaliza a parceria.
ambiguidades_relacionadas: []
sbvr:
  scd:
    scope:
      atores: [instituicao_autorizada_bcb]
      contexto: [baas]
      papeis: [sujeito_regulado]
    condition:
      existe: false
    demand:
      modalidade: obrigacao
      obrigacoes: [manter_contrato_formal]
`,
  "bcb-rc-16-r02.yaml": `
id: bcb-rc-16-r02
artigo: Art. 2o
modalidade: proibido
regra_sbvr: "É proibido ao PSP parceiro utilizar recursos de terceiros sem autorização."
texto_original: "É vedado ao PSP parceiro utilizar recursos de terceiros sem autorização."
keywords: [psp, recursos_terceiros, autorizacao]
vocabulario_conceitos: []
ambiguidades_relacionadas: []
sbvr:
  scd:
    scope:
      atores: [psp_parceiro]
      contexto: [baas]
      papeis: [sujeito_regulado]
    condition:
      existe: false
    demand:
      modalidade: proibicao
      proibicoes: [utilizar_recursos_terceiros]
`,
  "bcb-rc-17-r03.yaml": `
id: bcb-rc-17-r03
artigo: Art. 3o, caput
modalidade: proibido
regra_sbvr: "É proibido usar, na nomenclatura, termo que sugira atividade sem autorização."
texto_original: "É vedado utilizar, em sua nomenclatura, termo que sugira..."
keywords: [vedacao, nomenclatura, semelhanca_morfologica]
vocabulario_conceitos:
  - termo: nomenclatura
    conceito: Forma de apresentação ao público.
ambiguidades_relacionadas:
  - id: A-02
    titulo: Sugestão por semelhança morfológica
    descricao: Falta método formal.
sbvr:
  scd:
    scope:
      atores: [instituicao_autorizada_bcb]
      contexto: [nomenclatura_apresentacao_publico]
      papeis: [sujeito_regulado]
    condition:
      existe: false
    demand:
      modalidade: proibicao
      proibicoes: [cumprimento_da_regra]
`,
};

vi.mock("node:fs", () => ({
  readdirSync: vi.fn((dirPath: string) => {
    if (dirPath.includes("bcb-rc-16")) return ["bcb-rc-16-r01.yaml", "bcb-rc-16-r02.yaml"];
    if (dirPath.includes("bcb-rc-17")) return ["bcb-rc-17-r03.yaml"];
    return [];
  }),
  readFileSync: vi.fn((filePath: string) => {
    for (const [file, content] of Object.entries(mockYamls)) {
      if (filePath.endsWith(file)) return content;
    }
    throw new Error(`Unexpected file: ${filePath}`);
  }),
}));

import { regraSvc } from "../regra-service.js";
import { documentoSvc } from "../documento-service.js";

describe("RegraService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    regraSvc["regras"] = new Map();
    regraSvc.carregar();
  });

  describe("listar", () => {
    it("retorna todas as regras sem filtros", () => {
      const regras = regraSvc.listar();
      expect(regras).toHaveLength(3);
    });

    it("filtra por documento_id", () => {
      const regras = regraSvc.listar({ documento_id: "bcb-rc-16" });
      expect(regras).toHaveLength(2);
      expect(regras.every((r) => r.id.startsWith("bcb-rc-16"))).toBe(true);
    });

    it("filtra por tipo", () => {
      const regras = regraSvc.listar({ tipo: "proibicao" });
      expect(regras).toHaveLength(2);
      expect(regras.every((r) => r.modalidade === "proibido")).toBe(true);
    });

    it("filtra por termo no texto da regra", () => {
      const regras = regraSvc.listar({ termo: "nomenclatura" });
      expect(regras).toHaveLength(1);
      expect(regras[0].id).toBe("bcb-rc-17-r03");
    });

    it("filtra por termo em keywords", () => {
      const regras = regraSvc.listar({ termo: "contrato" });
      expect(regras).toHaveLength(1);
      expect(regras[0].id).toBe("bcb-rc-16-r01");
    });
  });

  describe("obter", () => {
    it("retorna regra por id", () => {
      const regra = regraSvc.obter("bcb-rc-16-r01");
      expect(regra).toBeDefined();
      expect(regra!.id).toBe("bcb-rc-16-r01");
    });

    it("retorna undefined para regra inexistente", () => {
      expect(regraSvc.obter("nao-existe")).toBeUndefined();
    });
  });

  describe("buscar", () => {
    it("retorna resultados ordenados por relevancia", () => {
      const results = regraSvc.buscar("contrato");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe("bcb-rc-16-r01");
    });

    it("retorna array vazio para consulta vazia", () => {
      expect(regraSvc.buscar("")).toEqual([]);
    });

    it("retorna array vazio sem correspondencia", () => {
      expect(regraSvc.buscar("xxxxxx")).toEqual([]);
    });
  });

  describe("extrairTaxonomia", () => {
    it("extrai atores das regras", () => {
      const tax = regraSvc.extrairTaxonomia();
      expect(tax.atores).toContain("instituicao_autorizada_bcb");
      expect(tax.atores).toContain("psp_parceiro");
    });
  });
});
