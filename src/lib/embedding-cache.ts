import { supabase } from "./supabase";

type EmbeddingCacheRow = {
    embedding: number[] | null;
};

export async function getCachedEmbedding(text: string): Promise<number[] | null> {
    const { data, error } = await supabase
        .from("embeddings_cache")
        .select("embedding")
        .eq("text", text)
        .maybeSingle<EmbeddingCacheRow>();

    if (error || !data?.embedding) return null;
    return data.embedding;
}

export async function storeEmbeddingCache(text: string, embedding: number[]) {
    await supabase
        .from("embeddings_cache")
        .upsert({ text, embedding }, { onConflict: "text" });
}
