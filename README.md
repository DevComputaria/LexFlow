# LexFlow — Regulatory Knowledge Platform

> **Status: Projeto em fase inicial (MVP).**  
> Plataforma para parsing, estruturação e consulta de normas regulatórias brasileiras, expondo inteligência regulatória via protocolo MCP (Model Context Protocol) e interface visual de inspeção semântica.

---

## Arquitetura

```
                         ┌──────────────────────┐
                         │  Normativos (PDF/MD)  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  Parser/Normalizer   │
                         │  (JSON + YAML SBVR)  │
                         └──────────┬───────────┘
                                    │
                         ┌──────────┴───────────┐
                         │                      │
                         ▼                      ▼
                  ┌──────────────┐     ┌──────────────────┐
                  │  MCP Server  │     │   Preview UI     │
                  │  :3001       │     │   :3002          │
                  │  REST + SSE  │     │   Next.js        │
                  └──────────────┘     └──────────────────┘
                         │                      │
                         ▼                      ▼
                  Agentes/LLMs           Humanos/Operação
```

### Componentes

| Camada | Tecnologia | Finalidade |
|---|---|---|
| **Parser** | Python | Extrai estrutura de normas (capítulos, artigos, incisos) e gera YAML SBVR |
| **MCP Server** | TypeScript + Express + `@modelcontextprotocol/sdk` | Expõe ferramentas regulatórias para LLMs e API REST |
| **Preview UI** | Next.js 15 + Tailwind CSS | Navegação e inspeção visual das regras SBVR |
| **Dados** | YAML + JSON | 117 regras SBVR modeladas, 2 resoluções completas em JSON |

---

## Dados disponíveis

| Norma | Regras SBVR | Artigos |
|---|---|---|
| Resolução Conjunta nº 16/2025 — Banking as a Service (BaaS) | 81 | 64 |
| Resolução Conjunta nº 17/2025 — Nomenclatura e Apresentação ao Público | 36 | 21 |
| **Total** | **117** | **85** |

### Estrutura de uma regra SBVR (YAML)

```yaml
id: bcb-rc-17-r03
referencia_normativa:
  ato: Resolucao Conjunta
  numero: 17
  data: 2025-11-28
artigo: Art. 3o, caput
modalidade: proibido
regra_sbvr: "É proibido usar, na nomenclatura, termo que sugira atividade ou tipo de instituição sem autorização de funcionamento específica."
sbvr:
  scd:
    scope:
      atores: [instituicao_autorizada_bcb]
      contexto: [nomenclatura_apresentacao_publico]
      papeis: [sujeito_regulado]
    condition:
      existe: false
    demand:
      modalidade: proibicao
      proibicoes: [cumprimento_da_regra]
texto_original: "É vedado [...] utilizar, em sua nomenclatura, termo que sugira..."
keywords: [vedacao, nomenclatura, semelhanca_morfologica, ...]
vocabulario_conceitos:
  - termo: termo
    conceito: Palavra, fragmento, expressão ou frase usada na nomenclatura.
ambiguidades_relacionadas:
  - id: A-02
    titulo: '"Sugestão" por semelhança morfológica ou fonética'
    descricao: Falta método formal para aferição de semelhança e limiar de aceitação.
```

---

## MCP Server

### Stack

| Tecnologia | Versão |
|---|---|
| Node.js | 22+ |
| TypeScript | 5.7 |
| Express | 4.21 |
| `@modelcontextprotocol/sdk` | 1.13 |
| js-yaml | 4.1 |

### Endpoints

#### REST API (`/api`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/documentos` | Lista normativos disponíveis |
| `GET` | `/api/documentos/:id` | Detalhes do normativo (capítulos, artigos) |
| `GET` | `/api/regras` | Lista regras (filtros: `documento_id`, `tipo`, `termo`) |
| `GET` | `/api/regras/:id` | Detalhes completos da regra (YAML + JSON estrutural) |
| `GET` | `/api/regras/buscar?q=` | Busca híbrida textual |
| `GET` | `/api/taxonomia/atores` | Lista atores extraídos das regras |
| `GET` | `/api/taxonomia/acoes` | Lista ações extraídas das regras |

#### MCP Protocol (`/mcp` SSE)

| Tool | Descrição | Parâmetros |
|---|---|---|
| `listar_documentos` | Lista normativos disponíveis | `dominio?`, `status?` |
| `listar_regras` | Lista regras filtradas | `documento_id?`, `tipo?`, `termo?` |
| `detalhar_regra` | Detalhes completos de uma regra | `regra_id` (obrigatório) |
| `buscar_regras` | Busca híbrida textual + keywords | `consulta` (obrigatório) |

### Como executar

```bash
cd mcp-server
npm install
npm run dev          # → http://localhost:3001
```

#### Testar com Claude Desktop

Adicione ao `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "lexflow": {
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

---

## Preview UI

### Stack

| Tecnologia | Versão |
|---|---|
| Next.js | 15.5 |
| React | 19 |
| TypeScript | 5.7 |
| Tailwind CSS | 4 |
| lucide-react | 0.480 |

### Funcionalidades (MVP)

- **Sidebar** com árvore de navegação: Documento → Modalidade (obrigação/proibição/permissão) → Regras
- **Busca textual** híbrida com scoring por relevância
- **Aba "Fonte"**: texto original do artigo com caput, incisos, alíneas formatados
- **Aba "SBVR"**: visualização em cards estruturados (atores, contexto, demanda, vocabulário, ambiguidades) com toggle para raw YAML
- **Aba "Norma Completa"**: resolução completa com capítulos colapsáveis
- **Menu hamburger** para toggle da sidebar
- **100% estático** — dados embedados no build, sem dependência de backend em runtime

### Como executar

```bash
cd preview-ui
npm install
npm run dev          # → http://localhost:3002
```

### Build estático

```bash
npm run build        # gera ./out/
npx serve out        # serve em qualquer porta
```

---

## Estrutura do projeto

```
/home/cleilson/compliance/
├── README.md
├── .gitignore
├── scripts/                       # Scripts utilitários
│   └── update_yaml.py            # Atualiza metadados dos YAMLs SBVR
├── bcb-rc-16-28-11-2025/          # Dados brutos RC 16
│   ├── resolucao-completa.md      # Texto integral da resolução
│   ├── rc16-estrutura-detalhada.json
│   ├── sbvr-bcb-rc-16-28-11-2025.md
│   ├── build_json_rc16.py
│   ├── generate_rc16_yamls.py
│   └── sbvr/                      # 81 YAMLs SBVR
├── bcb-rc-17-28-11-2025/          # Dados brutos RC 17
│   ├── resolucao-completa.md      # Texto integral da resolução
│   ├── rc17-estrutura-detalhada.json
│   ├── sbvr-bcb-rc-17-28-11-2025.md
│   ├── build_json_rc17.py
│   └── sbvr/                      # 36 YAMLs SBVR
├── mcp-server/                    # MCP Server (TypeScript)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts               # Entrypoint Express + MCP SSE
│       ├── schemas/models.ts      # Interfaces TypeScript
│       ├── services/              # Data access layer
│       │   ├── documento-service.ts
│       │   └── regra-service.ts
│       ├── mcp/                   # MCP tool definitions
│       │   ├── index.ts
│       │   ├── documentos.ts
│       │   └── regras.ts
│       └── api/                   # REST routes
│           ├── index.ts
│           ├── documentos.ts
│           ├── regras.ts
│           └── taxonomia.ts
└── preview-ui/                    # Preview UI (Next.js)
    ├── package.json
    ├── tsconfig.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── scripts/
    │   └── build-static-data.cjs  # Gera data.json dos YAMLs/JSONs
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx
        │   └── globals.css
        ├── components/
        │   ├── sidebar.tsx
        │   ├── main-panel.tsx
        │   ├── search-bar.tsx
        │   ├── rule-card.tsx
        │   ├── source-viewer.tsx
        │   ├── yaml-viewer.tsx      # Visual + toggle YAML
        │   └── document-viewer.tsx  # Norma completa
        ├── lib/
        │   └── api.ts
        └── types/
            └── index.ts
```

---

## Roadmap

### Fase 1 — MVP ✅
- [x] Parser JSON estrutural (capítulos, artigos, incisos, alíneas)
- [x] Geração de YAMLs SBVR (117 regras)
- [x] MCP Server com 4 tools (listar/buscar/detalhar)
- [x] Preview UI estático com sidebar, busca, fonte + SBVR + norma completa

### Fase 2 — Próximos passos
- [ ] Lineage tracking (PDF → Chunk → AST → SBVR → Review)
- [ ] Semantic AST intermediário (extrair triplas ator-ação-objeto)
- [ ] Taxonomia formal (actors.yaml, actions.yaml, objects.yaml)
- [ ] Comparação de versões (diff textual + estrutural)
- [ ] Search com embeddings

### Fase 3 — Visão
- [ ] Graph/Ontology (Neo4j)
- [ ] Impact analysis engine
- [ ] Alertas de mudança regulatória
- [ ] Workflow de revisão e validação

---

## Licença

Projeto interno — uso corporativo.
