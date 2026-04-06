"use client";
import { useEffect, useState } from "react";
import { BarChart, Key, CreditCard, Plus, Command, AlertCircle } from "lucide-react";
import { NanoCard } from "@/components/ui-nano";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        fetch("/api/user/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (r) => {
                if (r.status === 401) {
                    localStorage.removeItem("token");
                    router.push("/login");
                    return;
                }
                if (!r.ok) throw new Error(`Server error: ${r.status}`);
                return r.json();
            })
            .then((d) => { if (d) setData(d); })
            .catch((e) => setError(e.message));
    }, []);

    if (error) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-red-400">
            <AlertCircle size={48} className="opacity-60" />
            <p className="font-black text-sm uppercase tracking-widest">{error}</p>
        </div>
    );

    if (!data) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center font-black animate-pulse opacity-20">
            BOOTING...
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex">
            <aside className="w-20 md:w-64 border-r border-border flex flex-col p-6 gap-6">
                <div className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center font-black"><Command size={20} /></div>
                <nav className="flex-1 flex flex-col gap-2">
                    {[
                        { icon: BarChart, label: "Metrics", active: true },
                        { icon: Key, label: "Keys" },
                        { icon: CreditCard, label: "Billing" }
                    ].map((item, i) => (
                        <button key={i} className={`p-4 rounded-2xl flex items-center gap-4 transition-all ${item.active ? "bg-foreground text-background" : "hover:bg-border opacity-50"}`}>
                            <item.icon size={20} />
                            <span className="hidden md:block text-xs font-black uppercase tracking-tighter">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <button
                    onClick={() => { localStorage.removeItem("token"); router.push("/login"); }}
                    className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-all"
                >
                    Logout
                </button>
            </aside>

            <main className="flex-1 p-10 space-y-12">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tightest">{data.user.email}</h1>
                        <p className="opacity-40 text-xs font-bold uppercase tracking-widest mt-1">Tier: {data.user.plan}</p>
                    </div>
                    <button className="px-6 py-3 bg-accent text-white rounded-full font-black text-xs uppercase shadow-lg shadow-accent/20 flex items-center gap-2">
                        <Plus size={16} /> New Entity
                    </button>
                </header>

                <div className="grid md:grid-cols-4 gap-4">
                    {[
                        { label: "Throughput", value: data.usage.total },
                        { label: "Deployment Nodes", value: data.projects.length },
                        { label: "Traffic / 24h", value: data.usage.daily },
                        { label: "Saturation", value: `${data.usage.limit > 0 ? Math.round((data.usage.total / data.usage.limit) * 100) : 0}%` }
                    ].map((s, i) => (
                        <NanoCard key={i} className="p-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{s.label}</h4>
                            <div className="text-2xl font-black">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
                        </NanoCard>
                    ))}
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest opacity-20">Active Modules</h3>
                    {data.projects.length === 0 ? (
                        <div className="p-12 nano-glass rounded-3xl text-center opacity-30">
                            <p className="font-black text-sm uppercase tracking-widest">No modules deployed yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {data.projects.map((p: any) => (
                                <div key={p.id} className="p-6 nano-glass rounded-3xl flex items-center justify-between border border-transparent hover:border-border transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-border rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors"><Command size={14} /></div>
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-tighter">{p.name}</h4>
                                            <code className="text-[10px] opacity-30 font-bold">{p.apiKey}</code>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <div className="text-xs font-black">{p.tokens.toLocaleString()}</div>
                                            <div className="text-[10px] opacity-30 uppercase font-black tracking-widest">Tokens</div>
                                        </div>
                                        <button className="text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 hover:text-red-500 transition-all">Destroy</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
