"use client";

import { BookOpen, GitBranch, FileText } from "lucide-react";
import { useState } from "react";
import type { DocumentoResumo, RegraDetalhada } from "@/types";
import SourceViewer from "./source-viewer";
import YamlViewer from "./yaml-viewer";
import DocumentViewer from "./document-viewer";

interface MainPanelProps {
  regra: RegraDetalhada | null;
  documentosCompletos: any[];
  carregando: boolean;
}

type Aba = "fonte" | "yaml" | "completa";

const ABAS: { id: Aba; label: string; icon: typeof BookOpen }[] = [
  { id: "fonte", label: "Fonte", icon: BookOpen },
  { id: "yaml", label: "SBVR", icon: GitBranch },
  { id: "completa", label: "Norma Completa", icon: FileText },
];

export default function MainPanel({ regra, documentosCompletos, carregando }: MainPanelProps) {
  const [abaAtiva, setAbaAtiva] = useState<Aba>("fonte");

  const documentoCompleto = regra
    ? documentosCompletos.find((d: any) => d.id === regra.documento.id)
    : null;

  if (carregando) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!regra) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <BookOpen
            size={48}
            className="mx-auto mb-4 text-[var(--text-muted)]"
          />
          <h3 className="text-lg font-semibold text-[var(--text-secondary)] mb-2">
            LexFlow
          </h3>
          <p className="text-sm text-[var(--text-muted)]">
            Selecione uma regra na sidebar para visualizar seus detalhes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {regra.id}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {regra.artigo}
          </span>
        </div>
        <h2 className="text-base font-medium text-[var(--text-primary)] leading-relaxed">
          {regra.regra_sbvr}
        </h2>
      </div>

      <div className="flex border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        {ABAS.map((aba) => {
          const Icon = aba.icon;
          const ativa = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                ativa
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Icon size={14} />
              {aba.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {abaAtiva === "fonte" && <SourceViewer regra={regra} />}
        {abaAtiva === "yaml" && <YamlViewer regra={regra} />}
        {abaAtiva === "completa" && documentoCompleto && (
          <DocumentViewer
            documentoResumo={regra.documento}
            documentoCompleto={documentoCompleto}
          />
        )}
      </div>
    </div>
  );
}
