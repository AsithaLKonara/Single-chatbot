"use client";

import { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { getSystemContext } from "@/lib/context";

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const newMessages = [...messages, { role: "user", content: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                body: JSON.stringify({
                    messages: newMessages,
                    context: getSystemContext()
                }),
            });
            const data = await res.json();
            setMessages([...newMessages, { role: "assistant", content: data.content }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen ? (
                <div className="bg-white dark:bg-zinc-900 border rounded-xl shadow-2xl w-80 h-96 flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-zinc-50 dark:bg-zinc-800 rounded-t-xl">
                        <h3 className="font-semibold">OmniChat AI</h3>
                        <button onClick={() => setIsOpen(false)}><X size={18} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${m.role === "user" ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"}`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="text-xs text-zinc-400">Thinking...</div>}
                    </div>
                    <div className="p-3 border-t flex gap-2">
                        <input
                            className="flex-1 bg-zinc-50 dark:bg-zinc-800 border-none rounded px-2 py-1 text-sm focus:ring-0"
                            placeholder="Type..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button onClick={sendMessage} className="bg-blue-600 text-white p-1.5 rounded"><Send size={16} /></button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
                    <MessageCircle size={24} />
                </button>
            )}
        </div>
    );
}
