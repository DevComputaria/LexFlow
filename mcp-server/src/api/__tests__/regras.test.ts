import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import regrasRouter from "../regras.js";

vi.mock("../../services/regra-service.js", () => ({
  regraSvc: {
    listar: vi.fn(() => [
      { id: "bcb-rc-16-r01", artigo: "Art. 1o", modalidade: "obrigado", regra_sbvr: "teste", documento_id: "bcb-rc-16" },
    ]),
    buscar: vi.fn((q: string) => {
      if (!q) return [];
      return [{ id: "bcb-rc-16-r01", relevancia: 10, regra_sbvr: "teste", artigo: "Art. 1o", modalidade: "obrigado", documento_id: "bcb-rc-16" }];
    }),
    obterDetalhada: vi.fn((id: string) => {
      if (id === "bcb-rc-16-r01") return { id, regra_sbvr: "teste" };
      return undefined;
    }),
  },
}));

const app = express();
app.use(express.json());
app.use("/regras", regrasRouter);

describe("GET /regras", () => {
  it("retorna lista de regras", async () => {
    const res = await request(app).get("/regras");
    expect(res.status).toBe(200);
    expect(res.body.regras).toHaveLength(1);
    expect(res.body.total).toBe(1);
  });
});

describe("GET /regras/:id", () => {
  it("retorna regra detalhada", async () => {
    const res = await request(app).get("/regras/bcb-rc-16-r01");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("bcb-rc-16-r01");
  });

  it("retorna 404 para regra inexistente", async () => {
    const res = await request(app).get("/regras/invalida");
    expect(res.status).toBe(404);
  });
});

describe("GET /regras/buscar", () => {
  it("retorna resultados para consulta", async () => {
    const res = await request(app).get("/regras/buscar?q=teste");
    expect(res.status).toBe(200);
    expect(res.body.resultados).toBeDefined();
  });

  it("retorna 400 para consulta vazia", async () => {
    const res = await request(app).get("/regras/buscar?q=");
    expect(res.status).toBe(400);
  });
});
