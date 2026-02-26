"use client";
import { useEffect, useState } from "react";
import { Shield, Users, Activity, DollarSign } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch("/api/admin/stats").then(r => r.json()).then(setStats);
    }, []);

    if (!stats) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">Loading Admin...</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-10 font-sans">
            <header className="flex items-center gap-4 mb-20">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Shield size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black">Admin Meta-Command</h1>
                    <p className="text-zinc-500 font-medium">Control center for OmniChat SaaS</p>
                </div>
            </header>

            <section className="grid md:grid-cols-4 gap-6 mb-12">
                {[
                    { icon: Users, label: "Total Users", val: stats.users, trend: "+12%" },
                    { icon: Activity, label: "Total Tokens", val: stats.tokens.toLocaleString(), trend: "+5%" },
                    { icon: DollarSign, label: "MRR", val: `$${stats.revenue}`, trend: "+20%" },
                    { icon: Activity, label: "Active Nodes", val: stats.nodes, trend: "Stable" }
                ].map((s, i) => (
                    <div key={i} className="p-8 rounded-[32px] bg-white/5 border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/5 rounded-xl text-zinc-400"><s.icon size={20} /></div>
                            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">{s.trend}</span>
                        </div>
                        <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{s.label}</h4>
                        <div className="text-3xl font-black">{s.val}</div>
                    </div>
                ))}
            </section>

            <section className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden">
                <div className="p-8 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Incursion Monitor (Active Users)</h3>
                    <button className="text-xs font-bold text-blue-500 hover:underline">View All Users</button>
                </div>
                <table className="w-full text-left">
                    <thead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5">
                        <tr>
                            <th className="p-8">User / Entity</th>
                            <th className="p-8">Tier</th>
                            <th className="p-8">Saturation</th>
                            <th className="p-8 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-medium">
                        {stats.recentUsers.map((u: any, i: number) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="p-8">
                                    <div className="font-bold text-white">{u.email}</div>
                                    <div className="text-xs text-zinc-600">{u.id}</div>
                                </td>
                                <td className="p-8"><span className="px-3 py-1 bg-white/5 rounded-full text-xs text-zinc-400">{u.plan}</span></td>
                                <td className="p-8">
                                    <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${u.saturation}%` }} />
                                    </div>
                                </td>
                                <td className="p-8 text-right">
                                    <button className="text-red-500/50 hover:text-red-500 transition-colors">Terminate</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
