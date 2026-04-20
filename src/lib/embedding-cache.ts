import { supabase } from "./supabase";

// Retrieve a cached embedding from the EmbeddingCache table
export async function getCachedEmbedding(text: string): Promise<number[] | null> {
    const { data, error } = await supabase
        .from("embedding_cache")
        .select("embedding")
        .eq("text", text)
        .maybeSingle();

    if (error || !data) return null;
    return data.embedding as number[];
}

// Store an embedding in the cache
export async function setCachedEmbedding(text: string, embedding: number[]): Promise<void> {
    await supabase
        .from("embedding_cache")
        .upsert({ text, embedding }, { onConflict: "text" });
}
