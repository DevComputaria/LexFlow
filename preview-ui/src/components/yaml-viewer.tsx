"use client";

import { useState } from "react";
import {
  Users,
  BookOpen,
  GitBranch,
  Clock,
  AlertTriangle,
  Tag,
  CheckCircle,
  Ban,
  FileCheck,
  Code,
  Eye,
} from "lucide-react";
import type { RegraDetalhada } from "@/types";
import { MODALIDADE_LABEL, MODALIDADE_COLOR } from "@/types";

interface YamlViewerProps {
  regra: RegraDetalhada;
}

function buildYaml(regra: RegraDetalhada): string {
  const lines: string[] = [];
  lines.push(`id: ${regra.id}`);
  lines.push(`artigo: ${regra.artigo}`);
  lines.push(`modalidade: ${regra.modalidade}`);
  lines.push(`regra_sbvr: "${regra.regra_sbvr}"`);
  lines.push(`texto_original: "${regra.texto_original}"`);
  lines.push("");
  if (regra.sbvr) {
    lines.push("sbvr:");
    lines.push("  scd:");
    lines.push("    scope:");
    lines.push(`      atores: [${regra.sbvr.scd.scope.atores.map((a: string) => `"${a}"`).join(", ")}]`);
    lines.push(`      contexto: [${regra.sbvr.scd.scope.contexto.map((c: string) => `"${c}"`).join(", ")}]`);
    lines.push(`      papeis: [${regra.sbvr.scd.scope.papeis.map((p: string) => `"${p}"`).join(", ")}]`);
    lines.push("    condition:");
    lines.push(`      existe: ${regra.sbvr.scd.condition.existe}`);
    lines.push("      regras: []");
    lines.push("    demand:");
    lines.push(`      modalidade: "${regra.sbvr.scd.demand.modalidade}"`);
    if (regra.sbvr.scd.demand.obrigacoes?.length) {
      lines.push(`      obrigacoes: [${regra.sbvr.scd.demand.obrigacoes.map((o: string) => `"${o}"`).join(", ")}]`);
    }
    if (regra.sbvr.scd.demand.proibicoes?.length) {
      lines.push(`      proibicoes: [${regra.sbvr.scd.demand.proibicoes.map((p: string) => `"${p}"`).join(", ")}]`);
    }
    if (regra.sbvr.scd.demand.permissoes?.length) {
      lines.push(`      permissoes: [${regra.sbvr.scd.demand.permissoes.map((p: string) => `"${p}"`).join(", ")}]`);
    }
    lines.push("");
  }
  lines.push(`keywords: [${regra.keywords.map((k) => `"${k}"`).join(", ")}]`);
  lines.push("");
  if (regra.vocabulario_conceitos.length > 0) {
    lines.push("vocabulario_conceitos:");
    for (const vc of regra.vocabulario_conceitos) {
      lines.push(`  - termo: "${vc.termo}"`);
      lines.push(`    conceito: "${vc.conceito}"`);
    }
    lines.push("");
  }
  if (regra.ambiguidades_relacionadas.length > 0) {
    lines.push("ambiguidades_relacionadas:");
    for (const amb of regra.ambiguidades_relacionadas) {
      lines.push(`  - id: "${amb.id}"`);
      lines.push(`    titulo: "${amb.titulo}"`);
      lines.push(`    descricao: "${amb.descricao}"`);
    }
  }
  return lines.join("\n");
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
      <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-tertiary)] flex items-center gap-2">
        <Icon size={14} className="text-[var(--accent)]" />
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function TagBadge({ label, color }: { label: string; color?: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
      style={{
        backgroundColor: color ? `${color}18` : "var(--bg-tertiary)",
        color: color || "var(--text-secondary)",
      }}
    >
      {label}
    </span>
  );
}

function VisualView({ regra, sbvr }: { regra: RegraDetalhada; sbvr: any }) {
  return (
    <>
      <div
        className="rounded-lg border p-4"
        style={{
          borderColor: `${MODALIDADE_COLOR[regra.modalidade]}40`,
          backgroundColor: `${MODALIDADE_COLOR[regra.modalidade]}08`,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${MODALIDADE_COLOR[regra.modalidade]}20`,
              color: MODALIDADE_COLOR[regra.modalidade],
            }}
          >
            {MODALIDADE_LABEL[regra.modalidade]}
          </span>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">{regra.id}</span>
          <span className="text-[11px] text-[var(--text-muted)]">{regra.artigo}</span>
        </div>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">
          {regra.regra_sbvr}
        </p>
      </div>

      {sbvr?.scd && (
        <>
          <Section icon={Users} title="Escopo — Atores">
            <div className="flex flex-wrap gap-1.5">
              {sbvr.scd.scope.atores.map((a: string) => (
                <TagBadge key={a} label={a} color={MODALIDADE_COLOR[regra.modalidade]} />
              ))}
              {sbvr.scd.scope.atores.length === 0 && (
                <span className="text-xs text-[var(--text-muted)]">Nenhum ator definido</span>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Contexto</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {sbvr.scd.scope.contexto.map((c: string) => <TagBadge key={c} label={c} />)}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Papéis</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {sbvr.scd.scope.papeis.map((p: string) => <TagBadge key={p} label={p} />)}
                </div>
              </div>
            </div>
          </Section>

          <Section icon={GitBranch} title="Condição">
            {sbvr.scd.condition.existe ? (
              <div className="space-y-1">
                {sbvr.scd.condition.regras.map((r: any, i: number) => (
                  <p key={i} className="text-xs text-[var(--text-primary)]">
                    <span className="text-[var(--warning)] font-medium">{r.tipo}:</span> {r.descricao}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">Sem condição associada. Regra de aplicação direta.</p>
            )}
          </Section>

          <Section
            icon={sbvr.scd.demand.modalidade === "proibicao" ? Ban : sbvr.scd.demand.modalidade === "permissao" ? FileCheck : CheckCircle}
            title={`Demanda — ${sbvr.scd.demand.modalidade ? MODALIDADE_LABEL[regra.modalidade] : "Ação"}`}
          >
            {sbvr.scd.demand.obrigacoes?.length > 0 && (
              <ul className="space-y-1">
                {sbvr.scd.demand.obrigacoes.map((o: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-primary)]">
                    <CheckCircle size={12} className="mt-0.5 shrink-0" style={{ color: MODALIDADE_COLOR.obrigado }} />
                    {o}
                  </li>
                ))}
              </ul>
            )}
            {sbvr.scd.demand.proibicoes?.length > 0 && (
              <ul className="space-y-1">
                {sbvr.scd.demand.proibicoes.map((p: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-primary)]">
                    <Ban size={12} className="mt-0.5 shrink-0" style={{ color: MODALIDADE_COLOR.proibido }} />
                    {p}
                  </li>
                ))}
              </ul>
            )}
            {sbvr.scd.demand.permissoes?.length > 0 && (
              <ul className="space-y-1">
                {sbvr.scd.demand.permissoes.map((p: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-primary)]">
                    <FileCheck size={12} className="mt-0.5 shrink-0" style={{ color: MODALIDADE_COLOR.permitido }} />
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        {regra.vocabulario_conceitos.length > 0 && (
          <Section icon={BookOpen} title="Vocabulário">
            <div className="space-y-2">
              {regra.vocabulario_conceitos.map((vc, i) => (
                <div key={i}>
                  <span className="text-xs font-semibold text-[var(--accent)]">{vc.termo}</span>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{vc.conceito}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
        {regra.keywords.length > 0 && (
          <Section icon={Tag} title="Palavras-chave">
            <div className="flex flex-wrap gap-1.5">
              {regra.keywords.map((kw) => <TagBadge key={kw} label={kw} />)}
            </div>
          </Section>
        )}
      </div>

      {regra.periodo_tempo?.existe && (
        <Section icon={Clock} title="Período / Prazo">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {regra.periodo_tempo.descricao && (
              <div>
                <span className="text-[var(--text-muted)]">Descrição:</span>
                <p className="text-[var(--text-primary)]">{regra.periodo_tempo.descricao}</p>
              </div>
            )}
            {regra.periodo_tempo.marco_inicial && (
              <div>
                <span className="text-[var(--text-muted)]">Marco inicial:</span>
                <p className="text-[var(--text-primary)]">{regra.periodo_tempo.marco_inicial}</p>
              </div>
            )}
            {regra.periodo_tempo.prazo && (
              <div>
                <span className="text-[var(--text-muted)]">Prazo:</span>
                <p className="text-[var(--text-primary)]">{regra.periodo_tempo.prazo}</p>
              </div>
            )}
            {regra.periodo_tempo.data_limite && (
              <div>
                <span className="text-[var(--text-muted)]">Data limite:</span>
                <p className="text-[var(--text-primary)]">{regra.periodo_tempo.data_limite}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {regra.ambiguidades_relacionadas.length > 0 && (
        <Section icon={AlertTriangle} title="Pontos de Atenção / Ambiguidades">
          <div className="space-y-3">
            {regra.ambiguidades_relacionadas.map((amb) => (
              <div key={amb.id} className="border-l-2 border-[var(--warning)] pl-3">
                <span className="text-[10px] font-mono text-[var(--warning)]">{amb.id}</span>
                <p className="text-xs font-medium text-[var(--text-primary)] mt-0.5">{amb.titulo}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{amb.descricao}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

function YamlView({ regra }: { regra: RegraDetalhada }) {
  const yaml = buildYaml(regra);
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
      <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-tertiary)] flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          YAML SBVR
        </span>
      </div>
      <pre className="p-4 text-xs font-mono text-[var(--text-primary)] leading-relaxed overflow-x-auto" style={{ background: "var(--bg-primary)" }}>
        <code>{yaml}</code>
      </pre>
    </div>
  );
}

export default function YamlViewer({ regra }: YamlViewerProps) {
  const [modoYaml, setModoYaml] = useState(false);
  const sbvr = regra.sbvr;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setModoYaml((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          style={{
            backgroundColor: modoYaml ? `${MODALIDADE_COLOR[regra.modalidade]}15` : "var(--bg-tertiary)",
            color: modoYaml ? MODALIDADE_COLOR[regra.modalidade] : "var(--text-secondary)",
          }}
        >
          {modoYaml ? <Eye size={14} /> : <Code size={14} />}
          {modoYaml ? "Visual" : "YAML"}
        </button>
      </div>

      {modoYaml ? <YamlView regra={regra} /> : <VisualView regra={regra} sbvr={sbvr} />}
    </div>
  );
}
