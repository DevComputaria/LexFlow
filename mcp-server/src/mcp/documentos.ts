import type { ToolDefinition } from "../schemas/models.js";
import { documentoSvc } from "../services/documento-service.js";

export const listarDocumentosTool: ToolDefinition = {
  name: "listar_documentos",
  description: "Lista normativos disponíveis no repositório regulatório",
  inputSchema: {
    type: "object",
    properties: {
      dominio: {
        type: "string",
        description: "Filtrar por domínio (ex: pix, openfinance, compliance, bacen)",
      },
      status: {
        type: "string",
        description: "Filtrar por status (ex: vigente)",
        enum: ["vigente"],
      },
    },
  },
};

export function handleListarDocumentos(args: Record<string, unknown>) {
  const documentos = documentoSvc.listar(
    args.dominio as string | undefined,
    args.status as string | undefined
  );

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ documentos }, null, 2),
      },
    ],
  };
}
