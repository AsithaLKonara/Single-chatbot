# OmniChat AI — Universal Context-Aware Chatbot Platform

Build a chatbot platform that can integrate into **any web product**, automatically understand application environment, user session, database structure, page context, and workflows to provide **accurate, intelligent, contextual responses**.

---

## 🚀 Project Progress

**Overall Progress: 100%**  
![Progress](https://progress-bar.dev/100/?scale=100&title=Progress&width=600)

- [x] Phase 1: Foundation (Completed)
- [x] Phase 2: Context System (Completed)
- [x] Phase 3: Knowledge System (Completed)
- [x] Phase 4: Memory System (Completed)
- [x] Phase 5: Universal SDK (Completed)
- [x] Phase 6: Admin Dashboard (Completed)
- [x] Phase 7: Optimization (Completed)
- [x] Phase 8: Production Deployment (Completed)

---

## 1. Project Proposal

### Vision
Build a chatbot platform that can integrate into **any web product**, automatically understand:
* Application environment
* User session
* Database structure
* Page context
* Workflows

and provide **accurate, intelligent, contextual responses**.

### Core Objectives
* Universal integration SDK
* Context-aware AI responses
* Automatic middle prompt generation
* High accuracy via RAG
* Free AI API based infrastructure
* Multi-product support

---

## 2. System Architecture

```mermaid
graph TD
    A[Frontend Website] --> B[OmniChat SDK]
    B --> C[Chat Widget UI]
    C --> D[Next.js Chat API]
    D --> E[AI Orchestrator Layer]
    E --> F[Context Engine]
    E --> G[Prompt Builder]
    E --> H[Knowledge Retrieval]
    H --> I[Vector DB - Supabase]
    G --> J[AI API - Groq]
    J --> K[Response]
    K --> C
```

---

## 3. Phase-by-Phase Roadmap

### Phase 1 — Foundation (Week 1)
**Goal:** Basic chatbot working with AI API.
- [x] Next.js project setup
- [x] Chat API route implementation
- [x] Groq API integration
- [x] Basic chat UI
- [x] Environment variables setup

### Phase 2 — Context System (Week 2)
**Goal:** Environment-aware chatbot.
- [x] Context extractor development
- [x] Dynamic prompt builder
- [x] Context injection system
- [x] URL & Session capture logic

### Phase 3 — Knowledge System (Week 3)
**Goal:** Accurate chatbot using knowledge (RAG).
- [x] Supabase setup & Vector DB configuration
- [x] Embedding system implementation
- [x] Retrieval algorithm (Semantic Search)
- [x] Document processing pipeline

### Phase 4 — Memory System (Week 4)
**Goal:** Chatbot remembers conversation.
- [x] Conversation storage schema
- [x] Memory retrieval logic
- [x] Session management
- [x] Multi-turn conversation handling

### Phase 5 — Universal SDK (Week 5)
**Goal:** Integrate chatbot into any website.
- [x] Bundleable JS SDK
- [x] `chatbot.init()` and `mount()` methods
- [x] Cross-domain communication (postMessage)
- [x] Authentication & Security

### Phase 6 — Admin Dashboard (Week 6)
**Goal:** Manage chatbot and knowledge.
- [x] Project management dashboard
- [x] Knowledge base upload (CSV/PDF/Link)
- [x] Conversation logs & Analytics
- [x] Usage monitoring

### Phase 7 — Optimization (Week 7)
**Goal:** Improve accuracy and speed.
- [x] Prompt engineering refinement
- [x] Response caching
- [x] Vector search tuning (re-ranking)
- [x] Performance benchmarking

### Phase 8 — Production Deployment (Week 8)
**Goal:** Live production system.
- [x] Vercel deployment
- [x] Database hardening
- [x] CI/CD pipeline setup
- [x] Final QA & Launch

---

## 4. Technology Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | Next.js, React, Tailwind CSS |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | Supabase (PostgreSQL + pgvector) |
| **AI Engine** | Groq (Llama 3), OpenAI SDK |
| **Hosting** | Vercel |

---

## 5. Database Design

### Projects Table
`id, name, api_key, created_at, user_id`

### Conversations Table
`id, project_id, user_id, message, response, timestamp`

### Knowledge Table
`id, project_id, content, embedding (vector), metadata`

---

## 6. Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Setup `.env.local` with your Groq and Supabase keys.
4. Run locally: `npm run dev`
