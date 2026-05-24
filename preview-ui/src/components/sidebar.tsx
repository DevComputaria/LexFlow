"use client";

import { ChevronDown, ChevronRight, FileText, Scale, Ban, Check } from "lucide-react";
import { useState } from "react";
import type { DocumentoResumo, RegraResumo, Modalidade } from "@/types";
import { MODALIDADE_LABEL, MODALIDADE_COLOR } from "@/types";

interface SidebarProps {
  documentos: DocumentoResumo[];
  regras: RegraResumo[];
  regraSelecionada: string | null;
  documentoAberto: string | null;
  modalidadeAberta: string | null;
  onSelectRegra: (id: string) => void;
  onToggleDocumento: (id: string) => void;
  onToggleModalidade: (modalidade: string) => void;
}

const MODALIDADES: Modalidade[] = ["obrigado", "proibido", "permitido"];

const MODALIDADE_ICON: Record<string, typeof Check> = {
  obrigado: Check,
  proibido: Ban,
  permitido: Scale,
};

export default function Sidebar({
  documentos,
  regras,
  regraSelecionada,
  documentoAberto,
  modalidadeAberta,
  onSelectRegra,
  onToggleDocumento,
  onToggleModalidade,
}: SidebarProps) {
  const regrasPorDocEMod = (docId: string, modalidade: string) =>
    regras.filter(
      (r) => r.documento_id === docId && r.modalidade === modalidade
    );

  return (
    <aside className="w-72 shrink-0 border-r border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-[var(--border)]">
        <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Normativos
        </h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {documentos.map((doc) => (
          <div key={doc.id}>
            <button
              onClick={() => onToggleDocumento(doc.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              {documentoAberto === doc.id ? (
                <ChevronDown size={14} className="shrink-0" />
              ) : (
                <ChevronRight size={14} className="shrink-0" />
              )}
              <FileText size={14} className="shrink-0 text-[var(--accent)]" />
              <span className="truncate">{doc.titulo}</span>
            </button>

            {documentoAberto === doc.id && (
              <div className="ml-4 mt-1 space-y-1">
                {MODALIDADES.map((mod) => {
                  const count = regrasPorDocEMod(doc.id, mod).length;
                  if (count === 0) return null;
                  const Icon = MODALIDADE_ICON[mod];
                  const isOpen =
                    modalidadeAberta === mod && documentoAberto === doc.id;
                  return (
                    <div key={mod}>
                      <button
                        onClick={() => onToggleModalidade(mod)}
                        className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                      >
                        {isOpen ? (
                          <ChevronDown size={12} className="shrink-0" />
                        ) : (
                          <ChevronRight size={12} className="shrink-0" />
                        )}
                        <Icon
                          size={12}
                          className="shrink-0"
                          style={{ color: MODALIDADE_COLOR[mod] }}
                        />
                        <span>{MODALIDADE_LABEL[mod]}</span>
                        <span className="ml-auto text-[var(--text-muted)]">
                          {count}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="ml-4 space-y-0.5">
                          {regrasPorDocEMod(doc.id, mod).map((regra) => (
                            <button
                              key={regra.id}
                              onClick={() => onSelectRegra(regra.id)}
                              className={`w-full text-left px-2 py-1 rounded text-xs transition-colors truncate ${
                                regraSelecionada === regra.id
                                  ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                              }`}
                            >
                              <span className="font-mono text-[10px] opacity-60">
                                {regra.id.split("-r")[1]}
                              </span>
                              {" "}
                              {regra.artigo}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
