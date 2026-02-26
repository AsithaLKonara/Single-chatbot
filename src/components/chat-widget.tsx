"use client";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, Minus, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSystemContext } from "@/lib/context";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function ChatWidget({
    defaultOpen = false,
    projectId,
    primaryColor = "#3b82f6"
}: {
    defaultOpen?: boolean,
    projectId?: string,
    primaryColor?: string
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const newMsgs = [...messages, { role: "user", content: input }];
        setMessages(newMsgs); setInput(""); setLoading(true);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMsgs, context: getSystemContext(), projectId, userId: "guest" }),
            });
            const data = await res.json();
            setMessages([...newMsgs, { role: "assistant", content: data.content }]);
        } finally { setLoading(false); }
    };

    return (
        <div
            className="fixed bottom-6 right-6 z-[9999] font-sans"
            style={{ "--primary": primaryColor } as any}
        >
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="chatbot-window w-[380px] h-[520px] shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] flex flex-col overflow-hidden relative"
                        style={{
                            background: "rgba(255, 255, 255, 0.45)",
                            backdropFilter: "blur(12px) saturate(180%)",
                            WebkitBackdropFilter: "blur(12px) saturate(180%)",
                            borderRadius: "24px",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                        }}
                    >
                        {/* Header */}
                        <div className="p-5 flex justify-between items-center border-b border-white/20 bg-white/10">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                                        <Globe size={20} />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white/50 rounded-full animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 text-sm leading-tight">OmniChat AI</h3>
                                    <span className="text-[10px] text-zinc-600 font-medium tracking-wide uppercase">Always Active</span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors text-zinc-700">
                                    <Minus size={18} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors text-zinc-700">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                                    <p className="text-sm font-medium">Hello! How can I assist you today?</p>
                                </div>
                            )}
                            {messages.map((m, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: m.role === "user" ? 10 : -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[85%] px-4 py-3 text-sm shadow-sm",
                                            m.role === "user"
                                                ? "bg-[var(--primary)] text-white rounded-2xl rounded-tr-none"
                                                : "bg-white/60 backdrop-blur-md border border-white/40 text-zinc-800 rounded-2xl rounded-tl-none"
                                        )}
                                    >
                                        {m.content}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/60 backdrop-blur-md border border-white/40 px-4 py-2 rounded-2xl rounded-tl-none flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/10 backdrop-blur-sm border-t border-white/20">
                            <div className="relative flex items-center gap-2 bg-white/40 border border-white/60 rounded-2xl p-1 shadow-inner focus-within:border-blue-400/50 transition-all">
                                <input
                                    className="flex-1 bg-transparent px-4 py-2 text-sm text-zinc-800 placeholder-zinc-500 outline-none"
                                    placeholder="Type a message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || loading}
                                    className="bg-[var(--primary)] text-white p-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale ring-offset-2 focus:ring-2 ring-blue-500"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="bg-white/40 backdrop-blur-xl border border-white/60 text-white p-4 rounded-full shadow-2xl relative group"
                    >
                        <div className="absolute inset-0 rounded-full bg-[var(--primary)] opacity-80 group-hover:opacity-100 transition-opacity" />
                        <MessageCircle size={32} className="relative z-10" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full z-20" />
                    </motion.button>
                )}
            </AnimatePresence>
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
