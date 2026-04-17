import { supabase } from "./supabase";

export async function saveMessage(sessionId: string, userId: string, message: string, response: string) {
    await supabase.from("conversations").insert({
        session_id: sessionId,
        user_id: userId,
        message,
        response,
    });
}

export async function getHistory(sessionId: string, userId: string) {
    const { data } = await supabase
        .from("conversations")
        .select("message, response")
        .eq("session_id", sessionId)
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(8);

    return (data || []).reverse();
}
