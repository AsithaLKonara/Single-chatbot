"use client";
import { Navbar, Section, NanoCard } from "@/components/ui-nano";
import { Copy, Terminal, Check, Command, Book, Globe, Shield, Code } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function DocsPage() {
    const [copied, setCopied] = useState(false);
    const copyCode = (t: string) => { navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const samples = {
        sdk: `<script>\n  window.OmniChatConfig = {\n    apiKey: "YOUR_API_KEY",\n    primaryColor: "#3b82f6"\n  };\n</script>\n<script src="https://universal-chatbot-psi.vercel.app/widget.js" async></script>`,
        curl: `curl -X POST https://universal-chatbot-psi.vercel.app/api/v1/chat \\\n  -H "x-api-key: YOUR_API_KEY" \\\n  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'`
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <Navbar />
            
            <div className="moving-bg" />

            <Section className="pt-40 pb-20">
                <div className="flex flex-col md:flex-row gap-20">
                    <div className="flex-1 space-y-12">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="flex items-center gap-3 mb-10 opacity-30">
                                <Book size={18} />
                                <span className="text-xs font-black uppercase tracking-[0.4em]">System Protocol v4.2</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tightest leading-[0.9] mb-10">Integration.</h1>
                            <p className="text-xl font-bold opacity-30 leading-relaxed uppercase tracking-tighter max-w-xl">
                                Detailed technical specifications for interfacing with the OmniChat neural core.
                            </p>
                        </motion.div>

                        <div className="space-y-20 pt-10">
                            <section className="space-y-8">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">01 / Universal SDK</h2>
                                <p className="text-sm opacity-50 leading-relaxed max-w-2xl">
                                    The easiest way to integrate. Embed our lightweight bridge script into your HTML for full context-aware chat capabilities.
                                </p>
                                <div className="space-y-4">
                                    <div className="rounded-[32px] bg-foreground text-background p-10 shadow-2xl relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6">
                                            <button onClick={() => copyCode(samples.sdk)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                        <pre className="text-xs md:text-sm font-mono font-bold leading-relaxed whitespace-pre-wrap opacity-80 uppercase tracking-tighter">
                                            {samples.sdk}
                                        </pre>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {["Shadow DOM Isolation", "Auto-Context", "Brand Mapping", "Analytics Logs"].map(f => (
                                            <div key={f} className="p-4 rounded-2xl bg-foreground/5 text-center text-[9px] font-black uppercase tracking-widest opacity-40">
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-8">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">02 / Neural API</h2>
                                <p className="text-sm opacity-50 leading-relaxed max-w-2xl">
                                    Full control for custom implementations. Interface directly with our sub-second inference cluster via standardized REST protocols.
                                </p>
                                <div className="rounded-[32px] bg-foreground text-background p-10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6">
                                        <button onClick={() => copyCode(samples.curl)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <pre className="text-xs md:text-sm font-mono font-bold leading-relaxed whitespace-pre-wrap opacity-80 uppercase tracking-tighter">
                                        {samples.curl}
                                    </pre>
                                </div>
                            </section>
                        </div>
                    </div>

                    <aside className="w-full md:w-[400px] space-y-6">
                        <NanoCard className="p-10 space-y-8 border-accent/20 bg-accent/[0.03]">
                            <div className="w-12 h-12 bg-accent text-white rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                <Shield size={24} />
                            </div>
                            <h4 className="text-2xl font-black uppercase tracking-tightest">Secure Ops.</h4>
                            <p className="text-xs font-bold opacity-30 leading-relaxed uppercase tracking-widest">
                                All communication is authorized via project-specific Neural Keys. Data is encrypted in transit and at rest.
                            </p>
                            <div className="pt-4 border-t border-accent/10 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Latency</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-accent">&lt; 400ms</span>
                            </div>
                        </NanoCard>
                        
                        <div className="p-10 rounded-[40px] border border-foreground/10 bg-foreground/[0.01] space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Quick Access</h4>
                            <div className="space-y-4">
                                {[
                                    { label: "Authentication", icon: Shield },
                                    { label: "Context Nodes", icon: Globe },
                                    { label: "Response Schema", icon: Code },
                                    { label: "Error Protocols", icon: Terminal },
                                ].map(item => (
                                    <button key={item.label} className="w-full flex items-center justify-between group">
                                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">
                                            <item.icon size={14} /> {item.label}
                                        </div>
                                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </Section>

            <footer className="py-20 text-center opacity-10 text-[9px] font-black uppercase tracking-[0.5em]">
                OMNICHAT PROTOCOL · SYSTEM STABLE
            </footer>
        </div>
    );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>;
}
