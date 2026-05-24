import type { DocumentoResumo, RegraResumo, RegraDetalhada, ResultadoBusca } from "@/types";

const BASE = "/api";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Erro ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function listarDocumentos(): Promise<DocumentoResumo[]> {
  return fetchJson<DocumentoResumo[]>(`${BASE}/documentos`);
}

export async function obterDocumento(id: string): Promise<unknown> {
  return fetchJson(`${BASE}/documentos/${id}`);
}

export async function listarRegras(params?: {
  documento_id?: string;
  tipo?: string;
  termo?: string;
}): Promise<{ regras: RegraResumo[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.documento_id) query.set("documento_id", params.documento_id);
  if (params?.tipo) query.set("tipo", params.tipo);
  if (params?.termo) query.set("termo", params.termo);
  const qs = query.toString();
  return fetchJson(`${BASE}/regras${qs ? `?${qs}` : ""}`);
}

export async function obterRegra(id: string): Promise<RegraDetalhada> {
  return fetchJson<RegraDetalhada>(`${BASE}/regras/${id}`);
}

export async function buscarRegras(
  consulta: string
): Promise<{ resultados: ResultadoBusca[]; total: number }> {
  return fetchJson(
    `${BASE}/regras/buscar?q=${encodeURIComponent(consulta)}`
  );
}
