"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Command, ArrowRight, ShieldCheck, Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async () => {
        if (!email || !password) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/register", {
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
                setError(data.error || "Authorization Error");
            }
        } catch (e) {
            setError("Network Congestion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex items-center justify-center p-6 font-sans selection:bg-accent/30 overflow-hidden relative">
            
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[440px] relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mb-12"
                >
                    <Link href="/" className="w-16 h-16 bg-foreground text-background rounded-[22px] flex items-center justify-center mb-8 shadow-2xl hover:scale-110 transition-transform">
                        <Command size={28} />
                    </Link>
                    <h1 className="text-4xl font-black uppercase tracking-tightest">Initialize.</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mt-3">Node Authorization Protocol</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="p-10 rounded-[48px] bg-foreground/[0.02] border border-foreground/10 shadow-2xl backdrop-blur-3xl space-y-8"
                >
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
                                onKeyDown={e => e.key === "Enter" && handleRegister()}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleRegister}
                        disabled={loading || !email || !password}
                        className="w-full py-6 bg-foreground text-background font-black text-xs uppercase tracking-widest rounded-[24px] shadow-2xl transition-all active:scale-[0.98] hover:scale-[1.02] disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-3 group"
                    >
                        {loading ? "Authorizing..." : (
                            <>Confirm Access <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>

                    <div className="pt-2 flex justify-center border-t border-foreground/5">
                        <Link href="/login" className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 hover:text-accent transition-all pt-6">Existing Assignment · Login</Link>
                    </div>
                </motion.div>

                <div className="mt-12 flex justify-center items-center gap-3 opacity-20 hover:opacity-50 transition-opacity">
                    <ShieldCheck size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Encrypted Neural Handshake</span>
                </div>
            </div>
        </div>
    );
}
