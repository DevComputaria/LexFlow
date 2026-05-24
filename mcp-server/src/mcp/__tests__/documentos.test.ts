import { describe, it, expect, vi } from "vitest";

vi.mock("../../services/documento-service.js", () => ({
  documentoSvc: {
    listar: vi.fn((_dominio?: string, _status?: string) => [
      { id: "bcb-rc-16", titulo: "Resolucao Conjunta nº 16", versao: "1.0", data_vigencia: "2025-11-28", ementa: "BaaS" },
      { id: "bcb-rc-17", titulo: "Resolucao Conjunta nº 17", versao: "1.0", data_vigencia: "2025-11-28", ementa: "Nomenclatura" },
    ]),
  },
}));

import { handleListarDocumentos } from "../documentos.js";

describe("MCP documentos handler", () => {
  it("retorna lista de documentos", () => {
    const result = handleListarDocumentos({});
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.documentos).toHaveLength(2);
    expect(parsed.documentos[0].id).toBe("bcb-rc-16");
    expect(parsed.documentos[1].id).toBe("bcb-rc-17");
  });
});
