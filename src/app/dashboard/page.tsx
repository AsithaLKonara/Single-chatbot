"use client";
import { useEffect, useState } from "react";
import { Zap, Key, CreditCard, BarChart, Plus } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        // Fetch user dashboard data
        fetch("/api/user/dashboard").then(r => r.json()).then(setData);
    }, []);

    if (!data) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 p-6 space-y-8">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Dashboard</h2>
                <nav className="space-y-2 text-sm font-medium text-zinc-400">
                    <Link href="/dashboard" className="flex items-center gap-3 p-3 bg-white/5 text-white rounded-xl"><BarChart size={18} /> Overview</Link>
                    <Link href="/dashboard/keys" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all"><Key size={18} /> API Keys</Link>
                    <Link href="/dashboard/billing" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all"><CreditCard size={18} /> Billing</Link>
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-10 space-y-10">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">{data.user.email}</h1>
                        <p className="text-zinc-500">Plan: <span className="text-blue-500 font-bold">{data.user.plan}</span></p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all">
                        <Plus size={18} /> New Project
                    </button>
                </header>

                <section className="grid md:grid-cols-3 gap-6">
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                        <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Usage</h4>
                        <div className="text-4xl font-black">{data.usage.total.toLocaleString()} <span className="text-sm font-medium opacity-40">Tokens</span></div>
                        <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${(data.usage.total / data.usage.limit) * 100}%` }} />
                        </div>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                        <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Active Projects</h4>
                        <div className="text-4xl font-black">{data.projects.length}</div>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                        <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Requests / 24h</h4>
                        <div className="text-4xl font-black">{data.usage.daily.toLocaleString()}</div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold">Recent Projects</h3>
                    <div className="grid gap-4">
                        {data.projects.map((p: any) => (
                            <div key={p.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-white/20 transition-all">
                                <div>
                                    <h4 className="font-bold">{p.name}</h4>
                                    <code className="text-xs text-zinc-500">{p.apiKey.slice(0, 10)}...</code>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold">{p.tokens.toLocaleString()} tokens</div>
                                    <div className="text-[10px] text-zinc-600">Created {new Date(p.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
