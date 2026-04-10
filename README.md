# inventory-ai-service

AI microservice built with Mastra (TypeScript) — RAG with pgvector, tool-calling agent, MCP server for Claude Desktop, memory, evals, and public chat UI. Connects to a real inventory system (Java + Spring Boot).

## Stack

- **Runtime:** Node.js + TypeScript
- **AI Framework:** Mastra
- **LLM:** Gemini 2.5 Flash
- **Embeddings:** Gemini Embedding 001
- **Connected backend:** Java 17 + Spring Boot (Railway)
- **Database:** PostgreSQL + pgvector (coming soon)

## Project Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Manual RAG with embeddings | ✅ Complete |
| 2 | Real RAG with pgvector | 🔄 Next |
| 3 | Agent with 6 tools | ⏳ Pending |
| 3.5 | MCP server for Claude Desktop | ⏳ Pending |
| 4 | Session memory | ⏳ Pending |
| 5 | Evals with Mastra | ⏳ Pending |
| 6 | Public UI + observability | ⏳ Pending |

---

## Phase 1 — Manual RAG with Embeddings

### What I built

A complete RAG (Retrieval-Augmented Generation) experiment from scratch, without a vector database, connected to a real inventory system deployed on Railway.

### How it works
User question
↓
Question embedding (3072-dimensional vector)
↓
Compare against embeddings of 29 real products
↓
Cosine similarity → find top 3 most relevant
↓
Enriched prompt → Gemini 2.5 Flash
↓
Natural language response

### Most interesting result

When asked **"What do I need to cook?"** — without any product containing the word "cook" — the model found Wheat Flour, Spaghetti Pasta, and Diana Rice through pure semantic similarity.

This demonstrated in practice that embeddings understand **meaning**, not just exact words.

### Limitations discovered

- Pure RAG is not suitable for questions that require all results from a category — it only returns the top N most similar, not all relevant ones.
- The correct solution for that case is an agent with tools that calls the API with real filters (Phase 3).

### Deliverable

`src/experiments/fase1_rag_manual.ts`

### How to run

```bash
# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Install dependencies
npm install

# Run the experiment
npm run fase1
```

---

*Project under construction — updated after each completed phase.*