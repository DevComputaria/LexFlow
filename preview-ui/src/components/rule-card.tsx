"use client";

import { ArrowRight } from "lucide-react";
import type { RegraResumo } from "@/types";
import { MODALIDADE_LABEL, MODALIDADE_COLOR } from "@/types";

interface RuleCardProps {
  regra: RegraResumo;
  onClick: () => void;
}

export default function RuleCard({ regra, onClick }: RuleCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--border-hover)] transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
              style={{
                backgroundColor: `${MODALIDADE_COLOR[regra.modalidade]}15`,
                color: MODALIDADE_COLOR[regra.modalidade],
              }}
            >
              {MODALIDADE_LABEL[regra.modalidade]}
            </span>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              {regra.id}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {regra.artigo}
            </span>
          </div>
          <p className="text-sm text-[var(--text-primary)] line-clamp-2">
            {regra.regra_sbvr}
          </p>
        </div>
        <ArrowRight
          size={16}
          className="shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors mt-1"
        />
      </div>
    </button>
  );
}
