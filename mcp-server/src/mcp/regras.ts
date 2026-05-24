import type { ToolDefinition } from "../schemas/models.js";
import { regraSvc } from "../services/regra-service.js";

export const tools: ToolDefinition[] = [
  {
    name: "listar_regras",
    description: "Lista regras regulatórias filtradas por documento, tipo ou termo",
    inputSchema: {
      type: "object",
      properties: {
        documento_id: {
          type: "string",
          description: "Filtrar por ID do documento (ex: bcb-rc-16, bcb-rc-17)",
        },
        tipo: {
          type: "string",
          description: "Filtrar por tipo de regra",
          enum: ["obrigacao", "proibicao", "permissao"],
        },
        termo: {
          type: "string",
          description: "Filtrar por termo no texto da regra ou keywords",
        },
      },
    },
  },
  {
    name: "detalhar_regra",
    description: "Retorna detalhes completos de uma regra: YAML SBVR, JSON estrutural, texto original e lineage",
    inputSchema: {
      type: "object",
      properties: {
        regra_id: {
          type: "string",
          description: "ID da regra (ex: bcb-rc-17-r03)",
        },
      },
      required: ["regra_id"],
    },
  },
  {
    name: "buscar_regras",
    description: "Busca híbrida em regras: textual + taxonomia + keywords",
    inputSchema: {
      type: "object",
      properties: {
        consulta: {
          type: "string",
          description: "Termo de busca (ex: obrigação PSP prazo D+1, regras fraude MED)",
        },
      },
      required: ["consulta"],
    },
  },
];

export function handleListarRegras(args: Record<string, unknown>) {
  const regras = regraSvc.listar({
    documento_id: args.documento_id as string | undefined,
    tipo: args.tipo as string | undefined,
    termo: args.termo as string | undefined,
  });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ regras, total: regras.length }, null, 2),
      },
    ],
  };
}

export function handleDetalharRegra(args: Record<string, unknown>) {
  const regraId = args.regra_id as string;
  if (!regraId) {
    return {
      content: [{ type: "text", text: JSON.stringify({ erro: "regra_id é obrigatório" }) }],
      isError: true,
    };
  }

  const detalhes = regraSvc.obterDetalhada(regraId);
  if (!detalhes) {
    return {
      content: [{ type: "text", text: JSON.stringify({ erro: `Regra ${regraId} não encontrada` }) }],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(detalhes, null, 2),
      },
    ],
  };
}

export function handleBuscarRegras(args: Record<string, unknown>) {
  const consulta = args.consulta as string;
  if (!consulta?.trim()) {
    return {
      content: [{ type: "text", text: JSON.stringify({ erro: "consulta é obrigatório" }) }],
      isError: true,
    };
  }

  const resultados = regraSvc.buscar(consulta);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ resultados, total: resultados.length }, null, 2),
      },
    ],
  };
}
