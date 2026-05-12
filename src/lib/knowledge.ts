import { supabase } from "./supabase";
import { groq } from "./groq";
import { getCachedEmbedding, setCachedEmbedding } from "./embedding-cache";

// Generate a deterministic mock embedding vector since Groq doesn't support embeddings yet
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        // Check cache first (Redis-resilient)
        const cached = await getCachedEmbedding(text);
        if (cached) return cached;

        // Mock embedding: Generate a deterministic 1536-dim vector based on text content
        // This allows the RAG pipeline to "function" without crashing
        const vector = new Array(1536).fill(0).map((_, i) => {
            const charCode = text.charCodeAt(i % text.length) || 0;
            return (charCode / 255) * Math.sin(i + charCode);
        });

        // Cache it (Redis-resilient)
        await setCachedEmbedding(text, vector);
        
        return vector;
    } catch (err) {
        console.warn("[KNOWLEDGE] Embedding generation fallback to zero-vector", err);
        return new Array(1536).fill(0);
    }
}

type KnowledgeMatch = { content: string; similarity: number };

// Semantic search using pgvector via Supabase RPC
export async function searchKnowledge(query: string): Promise<string[]> {
    try {
        const embedding = await generateEmbedding(query);

        const { data, error } = await supabase.rpc("match_knowledge", {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 4,
        });

        if (error) {
            console.error("Knowledge search error:", error.message);
            return [];
        }

        return (data as KnowledgeMatch[]).map((d) => d.content);
    } catch (err) {
        console.error("generateEmbedding failed:", err);
        return [];
    }
}

// Add a new knowledge entry (for admin ingestion)
export async function addKnowledgeEntry(
    content: string,
    metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
    try {
        const embedding = await generateEmbedding(content);

        const { error } = await supabase.from("knowledge").insert({
            content,
            embedding,
            metadata: metadata ?? {},
        });

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        return { success: false, error: String(err) };
    }
}
