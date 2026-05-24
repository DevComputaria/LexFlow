import express from "express";
import cors from "cors";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import apiRouter from "./api/index.js";
import { getToolDefinitions, getToolHandler } from "./mcp/index.js";
import { documentoSvc } from "./services/documento-service.js";
import { regraSvc } from "./services/regra-service.js";

const PORT = parseInt(process.env.PORT ?? "3001", 10);

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Inicializar dados
console.log("Carregando dados regulatórios...");
documentoSvc.carregar();
regraSvc.carregar();
console.log(
  `Documentos: ${documentoSvc.listar().length}, Regras: ${regraSvc.listar().length}`
);

// REST API
app.use("/api", apiRouter);

// MCP Server via SSE
const mcpServer = new Server(
  { name: "lexflow-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  const definitions = getToolDefinitions();
  return {
    tools: definitions.map((d) => ({
      name: d.name,
      description: d.description,
      inputSchema: d.inputSchema,
    })),
  };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const handler = getToolHandler(request.params.name);
  if (!handler) {
    return {
      content: [{ type: "text", text: `Tool desconhecida: ${request.params.name}` }],
      isError: true,
    };
  }
  return handler(request.params.arguments ?? {});
});

let transport: SSEServerTransport;

app.get("/mcp", (_req, res) => {
  transport = new SSEServerTransport("/mcp/message", res);
  mcpServer.connect(transport);
});

app.post("/mcp/message", (req, res) => {
  if (transport) {
    transport.handlePostMessage(req, res);
  }
});

app.listen(PORT, () => {
  console.log(`\n  LexFlow MCP Server rodando`);
  console.log(`  REST API:  http://localhost:${PORT}/api`);
  console.log(`  MCP SSE:   http://localhost:${PORT}/mcp`);
  console.log(`  Health:    http://localhost:${PORT}/api/health\n`);
});
