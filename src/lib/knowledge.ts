import { supabase } from "./supabase";

type KnowledgeMatch = { content: string };

export async function searchKnowledge(_query: string) {
    void _query;
    // Logic for semantic search via pgvector
    const { data, error } = await supabase.rpc("match_knowledge", {
        query_embedding: [], // To be generated
        match_threshold: 0.5,
        match_count: 3
    });

    if (error) return [];
    return (data as KnowledgeMatch[]).map((d) => d.content);
}
