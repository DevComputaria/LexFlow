import { describe, it, expect } from "vitest";

interface ResultadoBusca {
  id: string;
  relevancia: number;
  regra_sbvr: string;
  artigo: string;
  modalidade: string;
  documento_id: string;
}

function buscarRegras(consulta: string, regras: any[]): ResultadoBusca[] {
  if (!consulta.trim()) return [];
  const q = consulta.toLowerCase();
  const results: ResultadoBusca[] = [];

  for (const r of regras) {
    let score = 0;
    if (r.regra_sbvr?.toLowerCase().includes(q)) score += 10;
    if (r.texto_original?.toLowerCase().includes(q)) score += 5;
    if (r.keywords?.some((k: string) => k.toLowerCase().includes(q))) score += 3;
    if (r.vocabulario_conceitos?.some((v: any) => v.termo?.toLowerCase().includes(q) || v.conceito?.toLowerCase().includes(q))) score += 2;
    if (r.artigo?.toLowerCase().includes(q)) score += 1;
    if (score > 0) {
      results.push({ id: r.id, relevancia: score, regra_sbvr: r.regra_sbvr, artigo: r.artigo, modalidade: r.modalidade, documento_id: r.documento_id });
    }
  }

  results.sort((a, b) => b.relevancia - a.relevancia);
  return results.slice(0, 50);
}

const mockRegras = [
  {
    id: "bcb-rc-16-r01",
    regra_sbvr: "É obrigatório manter contrato formal com o PSP parceiro.",
    texto_original: "A instituição autorizada deve manter contrato formal com o PSP parceiro.",
    keywords: ["contrato", "psp", "formalizacao"],
    vocabulario_conceitos: [{ termo: "contrato formal", conceito: "Instrumento jurídico." }],
    artigo: "Art. 1o",
    modalidade: "obrigado",
    documento_id: "bcb-rc-16",
  },
  {
    id: "bcb-rc-17-r03",
    regra_sbvr: "É proibido usar termo que sugira atividade sem autorização.",
    texto_original: "É vedado utilizar termo que sugira...",
    keywords: ["vedacao", "nomenclatura"],
    vocabulario_conceitos: [{ termo: "nomenclatura", conceito: "Forma de apresentação." }],
    artigo: "Art. 3o, caput",
    modalidade: "proibido",
    documento_id: "bcb-rc-17",
  },
];

describe("buscarRegras", () => {
  it("retorna resultados vazios para consulta vazia", () => {
    expect(buscarRegras("", mockRegras)).toEqual([]);
  });

  it("retorna resultados ordenados por relevancia", () => {
    const results = buscarRegras("contrato", mockRegras);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe("bcb-rc-16-r01");
  });

  it("busca por keyword encontra regra", () => {
    const results = buscarRegras("nomenclatura", mockRegras);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("bcb-rc-17-r03");
  });

  it("busca por vocabulario_conceitos encontra regra", () => {
    const results = buscarRegras("Instrumento", mockRegras);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("bcb-rc-16-r01");
  });

  it("retorna vazio sem correspondencia", () => {
    expect(buscarRegras("xxx", mockRegras)).toEqual([]);
  });

  it("busca por artigo encontra regra", () => {
    const results = buscarRegras("Art. 3o", mockRegras);
    expect(results).toHaveLength(1);
  });
});
