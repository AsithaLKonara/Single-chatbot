# OmniChat - Single Application AI Chatbot

OmniChat is a context-aware chatbot integrated directly into one web application.
It uses RAG retrieval, conversation memory, and Groq inference to deliver accurate responses.

## Architecture

```text
Web App
 -> Chat Widget
 -> /api/chat
 -> Context Engine
 -> RAG Retrieval
 -> Groq AI
 -> Response
```

## Core Capabilities

- Context-aware responses from browser/application metadata
- Knowledge retrieval with Supabase + pgvector
- Session memory with conversation history
- Groq Llama model integration
- Internal dashboard for knowledge and conversation monitoring

## Data Model (simplified)

- `knowledge`: `id`, `content`, `embedding`, `metadata`, `timestamp`
- `conversations`: `id`, `session_id`, `user_id`, `message`, `response`, `timestamp`
- `sessions` (optional): `id`, `user_id`, `created_at`

## Getting Started

1. Install dependencies: `npm install`
2. Configure env values in `.env.local` (`GROQ_API_KEY`, Supabase keys)
3. Start local server: `npm run dev`
4. Open the app and chat through `/api/chat`

## Product Direction

This project is intentionally **single-instance**:
- No project management
- No per-project API keys
- No multi-tenant routing

