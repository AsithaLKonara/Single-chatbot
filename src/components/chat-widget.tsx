"use client";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, Minus, Zap, Command, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSystemContext } from "@/lib/context";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { CSSProperties } from "react";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function ChatWidget({
    defaultOpen = false,
    primaryColor = "#3b82f6"
}: {
    defaultOpen?: boolean,
    primaryColor?: string
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const widgetStyle: CSSProperties & { "--primary": string } = { "--primary": primaryColor };

    useEffect(() => {
        const key = "omnichat_session_id";
        const existing = localStorage.getItem(key);
        if (existing) {
            setSessionId(existing);
            return;
        }

        const created = crypto.randomUUID();
        localStorage.setItem(key, created);
        setSessionId(created);
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, loading]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        const newMsgs = [...messages, { role: "user", content: userMsg }];
        setMessages(newMsgs); 
        setInput(""); 
        setLoading(true);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    messages: newMsgs, 
                    context: getSystemContext(), 
                    session_id: sessionId || undefined,
                    userId: "guest" 
                }),
            });
            const returnedSessionId = res.headers.get("X-Session-Id");
            if (returnedSessionId && returnedSessionId !== sessionId) {
                localStorage.setItem("omnichat_session_id", returnedSessionId);
                setSessionId(returnedSessionId);
            }

            if (!res.body) return;
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let assistantContent = "";
            setMessages([...newMsgs, { role: "assistant", content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                assistantContent += decoder.decode(value, { stream: true });
                setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last?.role === "assistant") {
                        updated[updated.length - 1] = { ...last, content: assistantContent };
                    }
                    return updated;
                });
            }
        } catch (e) {
            console.error("Chat error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans selection:bg-white/20" style={widgetStyle}>
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 24, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.9, y: 24, filter: "blur(10px)" }}
                        className="chatbot-window w-[380px] md:w-[420px] h-[600px] flex flex-col overflow-hidden relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
                        style={{
                            background: "rgba(9, 9, 11, 0.85)",
                            backdropFilter: "blur(32px) saturate(200%)",
                            borderRadius: "32px",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                    >
                        {/* Status bar */}
                        <div className="px-5 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Secure Sync Active</span>
                            </div>
                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">v4.5-Neural</span>
                        </div>

                        {/* Header */}
                        <div className="p-6 flex justify-between items-center border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 group shadow-2xl">
                                    <Bot size={24} className="group-hover:scale-110 transition-transform" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white text-base leading-tight uppercase tracking-tighter">OmniChat AI</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Neural Cluster #A1</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsOpen(false)} className="p-2.5 hover:bg-white/5 rounded-2xl transition-all text-white/40 hover:text-white">
                                    <Minus size={20} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2.5 hover:bg-white/5 rounded-2xl transition-all text-white/40 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide scroll-smooth">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2 animate-pulse">
                                        <Command size={32} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-loose">OmniChat Core Online.<br/>Awaiting Identity Handshake...</p>
                                </div>
                            )}
                            {messages.map((m, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    key={i}
                                    className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[90%] px-5 py-4 text-sm leading-[1.6]",
                                            m.role === "user"
                                                ? "bg-white text-black font-semibold rounded-[24px] rounded-tr-sm shadow-xl"
                                                : "bg-white/5 border border-white/10 text-white/90 rounded-[24px] rounded-tl-sm backdrop-blur-sm prose-invert"
                                        )}
                                    >
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: (props) => <p className="mb-2 last:mb-0" {...props} />,
                                                ul: (props) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                                ol: (props) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                                                li: (props) => <li className="mb-1" {...props} />,
                                                h1: (props) => <h1 className="text-lg font-black uppercase tracking-tight mb-2" {...props} />,
                                                h2: (props) => <h2 className="text-base font-black uppercase tracking-tight mb-2" {...props} />,
                                                code: (props) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />,
                                                pre: (props) => <pre className="bg-white/5 p-3 rounded-xl overflow-x-auto text-[13px] font-mono mb-2" {...props} />,
                                            }}
                                        >
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl flex gap-1.5 items-center">
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-gradient-to-t from-white/5 to-transparent border-t border-white/5">
                            <div className="relative flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-[28px] p-2 pr-2.5 shadow-2xl focus-within:border-white/20 focus-within:bg-white/[0.05] transition-all group">
                                <input
                                    className="flex-1 bg-transparent px-5 py-3 text-sm text-white placeholder-white/20 outline-none font-medium"
                                    placeholder="Type neural signal..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || loading}
                                    className="w-12 h-12 bg-white text-black rounded-[22px] hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100 flex items-center justify-center shadow-lg group-focus-within:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <div className="mt-4 flex justify-center items-center gap-2 opacity-10 cursor-default hover:opacity-25 transition-opacity">
                                <Zap size={8} className="fill-current" />
                                <span className="text-[8px] font-black uppercase tracking-[0.4em]">Integrated Intelligence by OmniChat</span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="w-16 h-16 bg-white text-black rounded-[24px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex items-center justify-center group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-10 transition-opacity" />
                        <MessageCircle size={28} className="relative z-10" />
                        <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 border-2 border-white rounded-full z-20 shadow-lg" />
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
