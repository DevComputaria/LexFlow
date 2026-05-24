"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { DocumentoResumo } from "@/types";

interface DocumentViewerProps {
  documentoResumo: DocumentoResumo;
  documentoCompleto: any;
}

function renderIncisos(incisos: any[]) {
  if (!incisos || incisos.length === 0) return null;
  return (
    <div className="ml-6 mt-1 space-y-0.5">
      {incisos.map((inc: any) => (
        <div key={inc.id}>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <span className="font-semibold text-[var(--accent)]">
              {inc.id} —{" "}
            </span>
            {inc.texto}
          </p>
          {inc.alineas && inc.alineas.length > 0 && (
            <div className="ml-6 mt-0.5 space-y-0.5">
              {inc.alineas.map((al: any) => (
                <div key={al.id}>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    <span className="text-[var(--warning)]">{al.id}) </span>
                    {al.texto}
                  </p>
                  {al.itens && al.itens.length > 0 && (
                    <div className="ml-6 mt-0.5 space-y-0.5">
                      {al.itens.map((it: any) => (
                        <p
                          key={it.id}
                          className="text-xs text-[var(--text-muted)] leading-relaxed"
                        >
                          <span className="text-[var(--text-muted)]">
                            {it.id}.{" "}
                          </span>
                          {it.texto}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function DocumentViewer({
  documentoResumo,
  documentoCompleto,
}: DocumentViewerProps) {
  const [capituloAberto, setCapituloAberto] = useState<string | null>("I");

  const capitulos = documentoCompleto?.estrutura?.capitulos ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
        <h2 className="text-sm font-bold text-[var(--accent)] mb-1">
          {documentoResumo.titulo}
        </h2>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {documentoResumo.ementa}
        </p>
        <div className="flex gap-4 mt-2 text-[11px] text-[var(--text-muted)]">
          <span>Versão: {documentoResumo.versao}</span>
          <span>Vigência: {documentoResumo.data_vigencia}</span>
        </div>
      </div>

      {capitulos.map((cap: any) => {
        const aberto = capituloAberto === cap.id;
        return (
          <div
            key={cap.id}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden"
          >
            <button
              onClick={() =>
                setCapituloAberto(aberto ? null : cap.id)
              }
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 transition-colors text-left"
            >
              {aberto ? (
                <ChevronDown size={14} className="shrink-0 text-[var(--accent)]" />
              ) : (
                <ChevronRight size={14} className="shrink-0 text-[var(--accent)]" />
              )}
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                CAPÍTULO {cap.id}
              </span>
              {cap.titulo && (
                <span className="text-xs text-[var(--text-muted)] ml-1">
                  — {cap.titulo}
                </span>
              )}
            </button>

            {aberto && (
              <div className="p-4 space-y-3">
                {cap.artigos?.map((art: any) => (
                  <div key={art.id}>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {art.rotulo}
                    </p>
                    {art.caput && (
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">
                        {art.caput}
                      </p>
                    )}
                    {renderIncisos(art.incisos)}
                    {art.paragrafos?.map((par: any) => (
                      <div key={par.id} className="mt-2">
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {par.id === "unico"
                            ? "Parágrafo único. "
                            : `§ ${par.id}º `}
                          {par.texto}
                        </p>
                        {renderIncisos(par.incisos)}
                      </div>
                    ))}
                  </div>
                ))}
                {(!cap.artigos || cap.artigos.length === 0) && (
                  <p className="text-xs text-[var(--text-muted)]">
                    Nenhum artigo neste capítulo.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
