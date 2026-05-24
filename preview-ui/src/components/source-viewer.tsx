"use client";

import type { RegraDetalhada } from "@/types";

interface SourceViewerProps {
  regra: RegraDetalhada;
}

export default function SourceViewer({ regra }: SourceViewerProps) {
  const artigo = regra.artigo_json;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
        <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Texto Original
          </span>
          <span className="ml-2 text-xs text-[var(--text-muted)]">
            {regra.artigo}
          </span>
        </div>
        <div className="p-4">
          <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
            {regra.texto_original}
          </p>
        </div>
      </div>

      {artigo?.caput && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Caput do Artigo
            </span>
          </div>
          <div className="p-4">
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              {artigo.caput}
            </p>
          </div>
        </div>
      )}

      {artigo?.incisos && artigo.incisos.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Incisos
            </span>
          </div>
          <div className="p-4 space-y-2">
            {artigo.incisos.map((inc) => (
              <div key={inc.id}>
                <p className="text-sm text-[var(--text-primary)]">
                  <span className="font-semibold text-[var(--accent)]">
                    {inc.id} —{" "}
                  </span>
                  {inc.texto}
                </p>
                {inc.alineas && inc.alineas.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {inc.alineas.map((al) => (
                      <p key={al.id} className="text-sm text-[var(--text-secondary)]">
                        <span className="text-[var(--warning)]">{al.id}) </span>
                        {al.texto}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
