import { supabase } from "./supabase";

export async function searchKnowledge(query: string, projectId: string) {
    // Logic for semantic search via pgvector
    const { data, error } = await supabase.rpc("match_knowledge", {
        query_embedding: [], // To be generated
        match_threshold: 0.5,
        match_count: 3,
        p_project_id: projectId
    });

    if (error) return [];
    return data.map((d: any) => d.content);
}
