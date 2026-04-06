"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Command, ArrowRight, ShieldCheck, Mail, Lock, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("token", data.token);
                router.push("/dashboard");
            } else {
                const data = await res.json();
                setError(data.error || "Authorization Failed");
            }
        } catch (e) {
            setError("Connectivity Failure");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex items-center justify-center p-6 font-sans selection:bg-accent/30 overflow-hidden relative">
            
            {/* Background effects */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[440px] relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mb-10"
                >
                    <Link href="/" className="w-16 h-16 bg-foreground text-background rounded-[22px] flex items-center justify-center mb-14 shadow-2xl hover:scale-110 transition-all border border-foreground/10">
                        <Command size={28} />
                    </Link>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="p-10 rounded-[48px] bg-foreground/[0.02] border border-foreground/10 shadow-2xl backdrop-blur-3xl space-y-8 relative"
                >
                    {/* Demo Banner */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-accent/10 border border-accent/20 text-accent px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap flex items-center gap-2 shadow-2xl backdrop-blur-3xl">
                        <Info size={12} /> Use: <span className="text-white">demo@system.ai</span> / <span className="text-white">demo</span>
                    </div>

                    <div className="text-center">
                        <h1 className="text-4xl font-black uppercase tracking-tightest">Authorize.</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mt-3">Identity Retrieval Protocol</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-4 flex items-center gap-2"><Mail size={12} /> Identifier</label>
                            <input
                                className="w-full bg-foreground/[0.04] border border-foreground/10 focus:border-accent/50 px-6 py-5 rounded-[24px] outline-none transition-all text-sm font-bold placeholder:opacity-20"
                                placeholder="USER@SYNTHETIC.AI"
                                value={email} onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-4 flex items-center gap-2"><Lock size={12} /> Passcode</label>
                            <input
                                type="password"
                                className="w-full bg-foreground/[0.04] border border-foreground/10 focus:border-accent/50 px-6 py-5 rounded-[24px] outline-none transition-all text-sm font-bold placeholder:opacity-20"
                                placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleLogin()}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleLogin}
                        disabled={loading || !email || !password}
                        className="w-full py-6 bg-foreground text-background font-black text-xs uppercase tracking-widest rounded-[24px] shadow-2xl transition-all active:scale-[0.98] hover:scale-[1.02] disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-3 group"
                    >
                        {loading ? "Authenticating..." : (
                            <>Authorize Session <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>

                    <div className="pt-2 flex justify-center border-t border-foreground/5">
                        <Link href="/register" className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 hover:text-accent transition-all pt-6">Request Node Initialization</Link>
                    </div>
                </motion.div>

                <div className="mt-12 flex justify-center items-center gap-3 opacity-20 hover:opacity-50 transition-opacity">
                    <ShieldCheck size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Neural Encryption Active</span>
                </div>
            </div>
        </div>
    );
}
