import type { ToolDefinition } from "../schemas/models.js";
import { listarDocumentosTool, handleListarDocumentos } from "./documentos.js";
import {
  tools as regraTools,
  handleListarRegras,
  handleDetalharRegra,
  handleBuscarRegras,
} from "./regras.js";

export interface McpToolHandler {
  definition: ToolDefinition;
  handler: (args: Record<string, unknown>) => {
    content: { type: string; text: string }[];
    isError?: boolean;
  };
}

const toolDefinitions: ToolDefinition[] = [listarDocumentosTool, ...regraTools];

const toolHandlers: Record<string, McpToolHandler["handler"]> = {
  listar_documentos: handleListarDocumentos,
  listar_regras: handleListarRegras,
  detalhar_regra: handleDetalharRegra,
  buscar_regras: handleBuscarRegras,
};

export function getToolDefinitions(): ToolDefinition[] {
  return toolDefinitions;
}

export function getToolHandler(name: string): McpToolHandler["handler"] | undefined {
  return toolHandlers[name];
}
