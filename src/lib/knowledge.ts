import { supabase } from "./supabase";
import { groq } from "./groq";
import { getCachedEmbedding, setCachedEmbedding } from "./embedding-cache";

// Generate a real embedding vector using Groq's nomic-embed-text model
export async function generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cached = await getCachedEmbedding(text);
    if (cached) return cached;

    const response = await groq.embeddings.create({
        model: "nomic-embed-text-v1_5",
        input: text,
    });

    const embedding = response.data[0].embedding;
    await setCachedEmbedding(text, embedding);
    return embedding;
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
