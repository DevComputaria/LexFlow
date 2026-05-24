"use client";

import { useMemo, useState, useCallback } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/sidebar";
import MainPanel from "@/components/main-panel";
import SearchBar from "@/components/search-bar";
import data from "@/data/regulatory-data.json";
import type {
  DocumentoResumo,
  RegraResumo,
  RegraDetalhada,
  ResultadoBusca,
} from "@/types";

function obterArtigo(docId: string, artigoRotulo: string): unknown {
  const doc = (data.documentos as any[]).find((d) => d.id === docId);
  if (!doc) return null;

  const artigoNum = parseInt(artigoRotulo.match(/\d+/)?.[0] ?? "0", 10);
  for (const cap of doc.estrutura?.capitulos ?? []) {
    for (const art of cap.artigos ?? []) {
      if (art.id === artigoNum) return art;
    }
  }
  return null;
}

function buscarRegras(consulta: string): ResultadoBusca[] {
  if (!consulta.trim()) return [];
  const q = consulta.toLowerCase();
  const results: ResultadoBusca[] = [];

  for (const r of data.regras as any[]) {
    let score = 0;
    if (r.regra_sbvr?.toLowerCase().includes(q)) score += 10;
    if (r.texto_original?.toLowerCase().includes(q)) score += 5;
    if (r.keywords?.some((k: string) => k.toLowerCase().includes(q))) score += 3;
    if (
      r.vocabulario_conceitos?.some(
        (v: any) =>
          v.termo?.toLowerCase().includes(q) ||
          v.conceito?.toLowerCase().includes(q)
      )
    )
      score += 2;
    if (r.artigo?.toLowerCase().includes(q)) score += 1;

    if (score > 0) {
      results.push({
        id: r.id,
        relevancia: score,
        regra_sbvr: r.regra_sbvr,
        artigo: r.artigo,
        modalidade: r.modalidade,
        documento_id: r.documento_id,
      });
    }
  }

  results.sort((a, b) => b.relevancia - a.relevancia);
  return results.slice(0, 50);
}

export default function Home() {
  const [regraSelecionada, setRegraSelecionada] = useState<string | null>(null);
  const [documentoAberto, setDocumentoAberto] = useState<string | null>(null);
  const [modalidadeAberta, setModalidadeAberta] = useState<string | null>(null);
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<
    ResultadoBusca[] | null
  >(null);

  // Dados estáticos
  const documentos = useMemo(() => data.documentos as DocumentoResumo[], []);
  const documentosCompletos = useMemo(() => data.documentos as any[], []);
  const todasRegras = useMemo(() => data.regras as any[], []);

  const regras: RegraResumo[] = useMemo(
    () =>
      todasRegras.map((r: any) => ({
        id: r.id,
        artigo: r.artigo,
        modalidade: r.modalidade,
        regra_sbvr: r.regra_sbvr,
        documento_id: r.documento_id,
      })),
    [todasRegras]
  );

  const regraDetalhada: RegraDetalhada | null = useMemo(() => {
    if (!regraSelecionada) return null;
    const r = todasRegras.find(
      (r: any) => r.id === regraSelecionada
    ) as any;
    if (!r) return null;

    const doc = documentos.find((d) => d.id === r.documento_id);
    const artigoJson = obterArtigo(r.documento_id, r.artigo);

    return {
      id: r.id,
      referencia_normativa: r.referencia_normativa,
      artigo: r.artigo,
      modalidade: r.modalidade,
      regra_sbvr: r.regra_sbvr,
      texto_original: r.texto_original,
      keywords: r.keywords,
      vocabulario_conceitos: r.vocabulario_conceitos,
      ambiguidades_relacionadas: r.ambiguidades_relacionadas,
      documento: doc ?? {
        id: r.documento_id,
        titulo: "",
        versao: "1.0",
        data_vigencia: "",
        ementa: "",
      },
      artigo_json: artigoJson as any,
    };
  }, [regraSelecionada, todasRegras, documentos]);

  const handleSelectRegra = useCallback((id: string) => {
    setRegraSelecionada(id);
    setResultadosBusca(null);
    setCarregando(false);
  }, []);

  const handleToggleDocumento = useCallback(
    (id: string) => {
      setDocumentoAberto((prev) => (prev === id ? null : id));
      setModalidadeAberta(
        id === documentoAberto ? null : "obrigado"
      );
    },
    [documentoAberto]
  );

  const handleToggleModalidade = useCallback((modalidade: string) => {
    setModalidadeAberta((prev) =>
      prev === modalidade ? null : modalidade
    );
  }, []);

  const handleSearch = useCallback(() => {
    if (!busca.trim()) {
      setResultadosBusca(null);
      return;
    }
    setResultadosBusca(buscarRegras(busca));
  }, [busca]);

  return (
    <div className="h-screen flex flex-col">
      <header className="h-12 px-4 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarAberta((v) => !v)}
            className="p-1 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title={sidebarAberta ? "Fechar sidebar" : "Abrir sidebar"}
          >
            {sidebarAberta ? <X size={16} /> : <Menu size={16} />}
          </button>
          <span className="text-sm font-bold text-[var(--accent)]">
            LexFlow
          </span>
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-l border-[var(--border)] pl-3 hidden sm:inline">
            Regulatory Knowledge Platform
          </span>
        </div>
        <SearchBar
          valor={busca}
          onChange={setBusca}
          onSearch={handleSearch}
        />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {resultadosBusca ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)]">
                Resultados da busca
              </h3>
              <button
                onClick={() => setResultadosBusca(null)}
                className="text-xs text-[var(--accent)] hover:underline"
              >
                Limpar busca
              </button>
            </div>
            <div className="space-y-2">
              {resultadosBusca.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectRegra(r.id)}
                  className="w-full text-left p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">
                      {r.id}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {r.artigo}
                    </span>
                    <span className="text-[10px] text-[var(--accent)] ml-auto">
                      score: {r.relevancia}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)]">
                    {r.regra_sbvr}
                  </p>
                </button>
              ))}
              {resultadosBusca.length === 0 && (
                <p className="text-sm text-[var(--text-muted)] text-center py-8">
                  Nenhum resultado encontrado.
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {sidebarAberta && (
              <Sidebar
                documentos={documentos}
                regras={regras}
                regraSelecionada={regraSelecionada}
                documentoAberto={documentoAberto}
                modalidadeAberta={modalidadeAberta}
                onSelectRegra={handleSelectRegra}
                onToggleDocumento={handleToggleDocumento}
                onToggleModalidade={handleToggleModalidade}
              />
            )}
            <MainPanel
              regra={regraDetalhada}
              documentosCompletos={documentosCompletos}
              carregando={carregando}
            />
          </>
        )}
      </div>
    </div>
  );
}
