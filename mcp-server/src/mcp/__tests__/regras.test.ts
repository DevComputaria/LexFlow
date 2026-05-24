import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRegras = [
  {
    id: "bcb-rc-16-r01",
    artigo: "Art. 1o",
    modalidade: "obrigado",
    regra_sbvr: "É obrigatório manter contrato formal.",
    documento_id: "bcb-rc-16",
  },
  {
    id: "bcb-rc-17-r03",
    artigo: "Art. 3o, caput",
    modalidade: "proibido",
    regra_sbvr: "É proibido usar termo que sugira atividade.",
    documento_id: "bcb-rc-17",
  },
];

vi.mock("../../services/regra-service.js", () => ({
  regraSvc: {
    listar: vi.fn((opts?: any) => {
      let results = [...mockRegras];
      if (opts?.documento_id) results = results.filter((r) => r.documento_id === opts.documento_id);
      if (opts?.tipo) results = results.filter((r) => r.modalidade === (opts.tipo === "proibicao" ? "proibido" : opts.tipo === "obrigacao" ? "obrigado" : "permitido"));
      if (opts?.termo) results = results.filter((r) => r.regra_sbvr.toLowerCase().includes(opts.termo.toLowerCase()));
      return results;
    }),
    obterDetalhada: vi.fn((id: string) => {
      if (id === "bcb-rc-16-r01") {
        return { id, regra_sbvr: "É obrigatório manter contrato formal.", documento: { id: "bcb-rc-16" }, artigo_json: { caput: "teste" } };
      }
      return undefined;
    }),
    buscar: vi.fn((consulta: string) => {
      if (!consulta.trim()) return [];
      return [{ id: "bcb-rc-16-r01", relevancia: 10, regra_sbvr: "teste", artigo: "Art. 1o", modalidade: "obrigado", documento_id: "bcb-rc-16" }];
    }),
  },
}));

import { handleListarRegras, handleDetalharRegra, handleBuscarRegras } from "../regras.js";

describe("MCP regras handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleListarRegras", () => {
    it("retorna todas as regras sem filtros", () => {
      const result = handleListarRegras({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.regras).toHaveLength(2);
      expect(parsed.total).toBe(2);
    });

    it("filtra por documento_id", () => {
      const result = handleListarRegras({ documento_id: "bcb-rc-16" });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.regras).toHaveLength(1);
      expect(parsed.regras[0].id).toBe("bcb-rc-16-r01");
    });
  });

  describe("handleDetalharRegra", () => {
    it("retorna detalhes da regra existente", () => {
      const result = handleDetalharRegra({ regra_id: "bcb-rc-16-r01" });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.id).toBe("bcb-rc-16-r01");
    });

    it("retorna erro para regra_id ausente", () => {
      const result = handleDetalharRegra({});
      expect(result.isError).toBe(true);
    });

    it("retorna erro para regra inexistente", () => {
      const result = handleDetalharRegra({ regra_id: "nao-existe" });
      expect(result.isError).toBe(true);
    });
  });

  describe("handleBuscarRegras", () => {
    it("retorna resultados para consulta valida", () => {
      const result = handleBuscarRegras({ consulta: "contrato" });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.resultados).toHaveLength(1);
    });

    it("retorna erro para consulta vazia", () => {
      const result = handleBuscarRegras({ consulta: "" });
      expect(result.isError).toBe(true);
    });
  });
});
