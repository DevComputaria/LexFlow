import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("node:fs", () => ({
  readFileSync: vi.fn((path: string) => {
    if (path.includes("rc16")) {
      return JSON.stringify({
        norma: {
          tipo: "Resolucao Conjunta",
          numero: 16,
          data: "2025-11-28",
          ementa: "Dispõe sobre Banking as a Service.",
          publicacao_dou: "28/11/2025",
        },
        estrutura: { capitulos: [{ id: "I", titulo: "Disposições Preliminares", artigos: [] }] },
      });
    }
    if (path.includes("rc17")) {
      return JSON.stringify({
        norma: {
          tipo: "Resolucao Conjunta",
          numero: 17,
          data: "2025-11-28",
          ementa: "Disciplina nomenclatura.",
          publicacao_dou: "28/11/2025",
        },
        estrutura: { capitulos: [] },
      });
    }
    throw new Error(`Unexpected path: ${path}`);
  }),
}));

import { documentoSvc } from "../documento-service.js";

describe("DocumentoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    documentoSvc.carregar();
  });

  it("listar retorna todos os documentos", () => {
    const docs = documentoSvc.listar();
    expect(docs).toHaveLength(2);
    expect(docs[0].id).toBe("bcb-rc-16");
    expect(docs[1].id).toBe("bcb-rc-17");
  });

  it("obter retorna documento por id", () => {
    const doc = documentoSvc.obter("bcb-rc-16");
    expect(doc).toBeDefined();
    expect(doc!.id).toBe("bcb-rc-16");
    expect(doc!.norma.numero).toBe(16);
  });

  it("obter retorna undefined para id inexistente", () => {
    expect(documentoSvc.obter("nao-existe")).toBeUndefined();
  });
});
