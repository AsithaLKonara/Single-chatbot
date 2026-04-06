"use client";
import { useEffect, useState, useCallback } from "react";
import {
    LayoutDashboard, FolderOpen, MessageSquare, BookOpen, Key,
    Plus, Trash2, Copy, Check, ChevronRight, Globe, Cpu,
    TrendingUp, Zap, Command, LogOut, X, AlertCircle, RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Project { id: string; name: string; apiKey: string; conversations: number; tokens: number; createdAt: string; }
interface Conversation { id: string; projectId: string; userId: string; message: string; response: string; createdAt: string; project: { name: string }; }
interface DashboardData { user: { id: string; email: string; plan: string; role: string }; projects: Project[]; usage: { total: number; daily: number; limit: number }; }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function authHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}
function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }
function timeAgo(date: string) {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

// ─── Sidebar nav ─────────────────────────────────────────────────────────────
const NAV = [
    { id: "overview", icon: LayoutDashboard, label: "Overview" },
    { id: "projects", icon: FolderOpen, label: "Projects" },
    { id: "conversations", icon: MessageSquare, label: "Logs" },
    { id: "docs", icon: BookOpen, label: "API Docs" },
];

// ─── Code snippet helper ──────────────────────────────────────────────────────
function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="relative rounded-2xl bg-foreground text-background overflow-hidden text-xs font-mono">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 opacity-40">
                <span className="uppercase text-[10px] tracking-widest">{lang}</span>
                <button onClick={copy} className="p-1 hover:opacity-100 opacity-60 transition-opacity">
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">{code}</pre>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
    const router = useRouter();
    const [tab, setTab] = useState("overview");
    const [data, setData] = useState<DashboardData | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [convTotal, setConvTotal] = useState(0);
    const [convPage, setConvPage] = useState(0);
    const [filterProject, setFilterProject] = useState<string>("");
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newProjectName, setNewProjectName] = useState("");
    const [creatingProject, setCreatingProject] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // ── Fetch dashboard overview ──────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/login"); return; }
        try {
            const res = await fetch("/api/user/dashboard", { headers: authHeaders() });
            if (res.status === 401) { localStorage.removeItem("token"); router.push("/login"); return; }
            const json = await res.json();
            setData(json);
            setProjects(json.projects || []);
        } catch (e: any) { setError(e.message); }
        finally { setLoadingData(false); }
    }, [router]);

    // ── Fetch conversations ───────────────────────────────────────────────────
    const fetchConversations = useCallback(async (page = 0, projectId = "") => {
        try {
            const params = new URLSearchParams({ skip: String(page * 20), take: "20" });
            if (projectId) params.set("projectId", projectId);
            const res = await fetch(`/api/user/conversations?${params}`, { headers: authHeaders() });
            const json = await res.json();
            setConversations(json.conversations || []);
            setConvTotal(json.total || 0);
        } catch {}
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { if (tab === "conversations") fetchConversations(convPage, filterProject); }, [tab, convPage, filterProject]);

    // ── Create project ────────────────────────────────────────────────────────
    const createProject = async () => {
        if (!newProjectName.trim()) return;
        setCreatingProject(true);
        try {
            const res = await fetch("/api/user/projects", {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ name: newProjectName }),
            });
            if (res.ok) {
                const p = await res.json();
                setProjects(prev => [p, ...prev]);
                setNewProjectName("");
                setShowCreate(false);
                fetchData();
            }
        } finally { setCreatingProject(false); }
    };

    // ── Delete project ────────────────────────────────────────────────────────
    const deleteProject = async (id: string) => {
        if (!confirm("Permanently destroy this module and all its data?")) return;
        await fetch(`/api/user/projects?id=${id}`, { method: "DELETE", headers: authHeaders() });
        setProjects(prev => prev.filter(p => p.id !== id));
        if (selectedProject?.id === id) setSelectedProject(null);
        fetchData();
    };

    const copyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const logout = () => { localStorage.removeItem("token"); router.push("/login"); };

    // ── Loading & error states ────────────────────────────────────────────────
    if (loadingData) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 opacity-30">
                <div className="w-10 h-10 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest">Initializing...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-background flex items-center justify-center gap-4 text-red-400">
            <AlertCircle size={32} />
            <p className="font-black text-sm uppercase tracking-widest">{error}</p>
        </div>
    );

    if (!data) return null;
    const saturation = data.usage.limit > 0 ? Math.min(100, Math.round((data.usage.total / data.usage.limit) * 100)) : 0;

    return (
        <div className="min-h-screen bg-background flex text-foreground" style={{ fontFamily: "var(--font-sans)" }}>

            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside className="w-16 md:w-60 border-r border-foreground/10 flex flex-col py-6 px-3 md:px-5 gap-2 sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-8 px-1">
                    <div className="w-8 h-8 bg-foreground text-background rounded-xl flex items-center justify-center flex-shrink-0">
                        <Command size={16} />
                    </div>
                    <span className="hidden md:block text-sm font-black tracking-tighter uppercase">OmniChat</span>
                </div>
                <nav className="flex-1 space-y-1">
                    {NAV.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left ${
                                tab === item.id
                                    ? "bg-foreground text-background"
                                    : "opacity-40 hover:opacity-80 hover:bg-foreground/5"
                            }`}
                        >
                            <item.icon size={18} className="flex-shrink-0" />
                            <span className="hidden md:block text-xs font-black uppercase tracking-tight">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="border-t border-foreground/10 pt-4 mt-2 space-y-3">
                    <div className="hidden md:block px-3 py-2">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-1">Account</p>
                        <p className="text-xs font-bold truncate opacity-70">{data.user.email}</p>
                        <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest bg-accent/10 text-accent px-2 py-0.5 rounded-full">{data.user.plan}</span>
                    </div>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl opacity-30 hover:opacity-100 hover:text-red-500 transition-all">
                        <LogOut size={18} className="flex-shrink-0" />
                        <span className="hidden md:block text-xs font-black uppercase tracking-tight">Logout</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────── */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">

                    {/* ── Overview ──────────────────────────────────── */}
                    {tab === "overview" && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Overview</h1>
                                    <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">System Status · All Green</p>
                                </div>
                                <button
                                    onClick={() => { setTab("projects"); setShowCreate(true); }}
                                    className="flex items-center gap-2 px-5 py-3 bg-foreground text-background rounded-full font-black text-xs uppercase tracking-tighter shadow-lg hover:opacity-80 transition-opacity"
                                >
                                    <Plus size={14} /> New Project
                                </button>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { icon: FolderOpen, label: "Projects", value: projects.length, sub: "Active modules" },
                                    { icon: TrendingUp, label: "Total Tokens", value: fmt(data.usage.total), sub: "All time" },
                                    { icon: Zap, label: "Daily Traffic", value: fmt(data.usage.daily), sub: "Last 24h" },
                                    { icon: Cpu, label: "Saturation", value: `${saturation}%`, sub: `of ${fmt(data.usage.limit)} limit` },
                                ].map((s, i) => (
                                    <div key={i} className="p-5 rounded-3xl border border-foreground/10 space-y-3 hover:border-foreground/30 transition-colors">
                                        <s.icon size={18} className="opacity-30" />
                                        <div className="text-2xl font-black">{s.value}</div>
                                        <div>
                                            <div className="text-xs font-black uppercase tracking-tighter">{s.label}</div>
                                            <div className="text-[10px] opacity-30 uppercase tracking-widest">{s.sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Saturation bar */}
                            <div className="rounded-3xl border border-foreground/10 p-6 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-40">Token Usage</span>
                                    <span className="text-xs font-black">{saturation}%</span>
                                </div>
                                <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent rounded-full transition-all duration-700"
                                        style={{ width: `${saturation}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] opacity-30 font-bold uppercase tracking-widest">
                                    <span>0</span><span>{fmt(data.usage.limit)}</span>
                                </div>
                            </div>

                            {/* Recent projects */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-widest opacity-30">Recent Modules</h3>
                                {projects.length === 0 ? (
                                    <div className="rounded-3xl border border-dashed border-foreground/20 p-12 text-center">
                                        <Globe size={32} className="mx-auto mb-4 opacity-20" />
                                        <p className="text-xs font-black uppercase tracking-widest opacity-30">No modules yet. Create your first project.</p>
                                    </div>
                                ) : (
                                    projects.slice(0, 3).map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => { setSelectedProject(p); setTab("projects"); }}
                                            className="w-full flex items-center justify-between p-5 rounded-2xl border border-foreground/10 hover:border-foreground/30 transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                                                    <FolderOpen size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-tighter">{p.name}</p>
                                                    <p className="text-[10px] opacity-30 uppercase font-bold tracking-widest">{p.conversations} logs · {fmt(p.tokens)} tokens</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="opacity-30 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))
                                )}
                                {projects.length > 3 && (
                                    <button onClick={() => setTab("projects")} className="w-full text-center text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity py-2">
                                        View all {projects.length} modules →
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Projects ──────────────────────────────────── */}
                    {tab === "projects" && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-black uppercase tracking-tighter">Projects</h1>
                                    <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">{projects.length} Active Modules</p>
                                </div>
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="flex items-center gap-2 px-5 py-3 bg-foreground text-background rounded-full font-black text-xs uppercase tracking-tighter shadow-lg hover:opacity-80 transition-opacity"
                                >
                                    <Plus size={14} /> New
                                </button>
                            </div>

                            {/* Create form */}
                            <AnimatePresence>
                                {showCreate && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 rounded-3xl border border-accent/30 bg-accent/5 flex gap-4 items-center">
                                            <input
                                                autoFocus
                                                className="flex-1 bg-transparent border-b border-foreground/20 py-2 text-sm font-bold outline-none placeholder:opacity-30"
                                                placeholder="Module name e.g. Support Bot"
                                                value={newProjectName}
                                                onChange={e => setNewProjectName(e.target.value)}
                                                onKeyDown={e => e.key === "Enter" && createProject()}
                                            />
                                            <button
                                                onClick={createProject}
                                                disabled={creatingProject || !newProjectName.trim()}
                                                className="px-5 py-2.5 bg-foreground text-background rounded-full font-black text-xs uppercase tracking-tighter disabled:opacity-40 transition-opacity"
                                            >
                                                {creatingProject ? "..." : "Create"}
                                            </button>
                                            <button onClick={() => setShowCreate(false)} className="p-2 opacity-30 hover:opacity-100 transition-opacity">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Project list */}
                            {projects.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-foreground/20 p-16 text-center">
                                    <Globe size={40} className="mx-auto mb-5 opacity-20" />
                                    <p className="text-xs font-black uppercase tracking-widest opacity-30 mb-4">No modules deployed.</p>
                                    <button onClick={() => setShowCreate(true)} className="px-6 py-3 bg-foreground text-background rounded-full font-black text-xs uppercase tracking-tighter">Create First Module</button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {projects.map(p => (
                                        <motion.div key={p.id} layout>
                                            <button
                                                onClick={() => setSelectedProject(selectedProject?.id === p.id ? null : p)}
                                                className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all text-left group ${
                                                    selectedProject?.id === p.id ? "border-accent/50 bg-accent/5" : "border-foreground/10 hover:border-foreground/30"
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedProject?.id === p.id ? "bg-accent text-white" : "bg-foreground/5 group-hover:bg-foreground/10"}`}>
                                                        <FolderOpen size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black uppercase tracking-tighter">{p.name}</p>
                                                        <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">{timeAgo(p.createdAt)} · {p.conversations} conversations</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right hidden md:block">
                                                        <div className="text-xl font-black">{fmt(p.tokens)}</div>
                                                        <div className="text-[10px] opacity-30 uppercase font-black tracking-widest">tokens</div>
                                                    </div>
                                                    <ChevronRight size={16} className={`opacity-30 transition-transform ${selectedProject?.id === p.id ? "rotate-90" : ""}`} />
                                                </div>
                                            </button>

                                            {/* Expanded project detail */}
                                            <AnimatePresence>
                                                {selectedProject?.id === p.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-2 p-6 rounded-3xl border border-foreground/10 space-y-5 bg-foreground/2">
                                                            {/* API Key */}
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 flex items-center gap-1.5"><Key size={10} /> API Key</p>
                                                                <div className="flex items-center gap-3 bg-foreground/5 rounded-2xl px-4 py-3">
                                                                    <code className="flex-1 text-xs font-bold opacity-60 truncate">{p.apiKey}</code>
                                                                    <button onClick={() => copyKey(p.apiKey)} className="flex-shrink-0 p-1.5 hover:opacity-100 opacity-40 transition-opacity">
                                                                        {copiedKey === p.apiKey ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {/* Integration snippet */}
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Quick Integration</p>
                                                                <CodeBlock lang="javascript" code={`fetch("https://universal-chatbot-psi.vercel.app/api/v1/chat", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "x-api-key": "${p.apiKey}"\n  },\n  body: JSON.stringify({\n    messages: [{ role: "user", content: "Hello!" }],\n    userId: "visitor-123"\n  })\n})\n.then(r => r.json())\n.then(d => console.log(d.content));`} />
                                                            </div>
                                                            {/* Action buttons */}
                                                            <div className="flex justify-between items-center pt-2 border-t border-foreground/10">
                                                                <button
                                                                    onClick={() => { setFilterProject(p.id); setTab("conversations"); }}
                                                                    className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter opacity-50 hover:opacity-100 transition-opacity"
                                                                >
                                                                    <MessageSquare size={14} /> View Logs
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteProject(p.id)}
                                                                    className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter opacity-30 hover:opacity-100 hover:text-red-500 transition-all"
                                                                >
                                                                    <Trash2 size={14} /> Destroy Module
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── Conversation Logs ─────────────────────────── */}
                    {tab === "conversations" && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-3xl font-black uppercase tracking-tighter">Conversation Logs</h1>
                                    <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">{convTotal} total interactions</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <select
                                        value={filterProject}
                                        onChange={e => { setFilterProject(e.target.value); setConvPage(0); }}
                                        className="bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-tighter outline-none"
                                    >
                                        <option value="">All Projects</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <button onClick={() => fetchConversations(convPage, filterProject)} className="p-2 opacity-40 hover:opacity-100 transition-opacity">
                                        <RefreshCw size={16} />
                                    </button>
                                </div>
                            </div>

                            {conversations.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-foreground/20 p-16 text-center">
                                    <MessageSquare size={40} className="mx-auto mb-5 opacity-20" />
                                    <p className="text-xs font-black uppercase tracking-widest opacity-30">No conversations yet. Integrate a project to start logging.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {conversations.map(c => (
                                        <div key={c.id} className="p-5 rounded-3xl border border-foreground/10 space-y-4 hover:border-foreground/20 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-widest bg-foreground/5 px-3 py-1 rounded-full opacity-60">{c.project.name}</span>
                                                <span className="text-[10px] opacity-30 font-bold uppercase tracking-widest">{timeAgo(c.createdAt)}</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-foreground/10 flex-shrink-0 flex items-center justify-center text-[10px] font-black opacity-50">U</div>
                                                    <p className="text-sm font-medium opacity-70 leading-relaxed">{c.message}</p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-accent/20 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-accent">AI</div>
                                                    <p className="text-sm font-medium opacity-70 leading-relaxed">{c.response}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Pagination */}
                                    {convTotal > 20 && (
                                        <div className="flex justify-center gap-3 pt-4">
                                            <button disabled={convPage === 0} onClick={() => setConvPage(p => p - 1)} className="px-4 py-2 rounded-full border border-foreground/10 text-xs font-black uppercase tracking-tighter disabled:opacity-20 hover:bg-foreground/5 transition-colors">← Prev</button>
                                            <span className="px-4 py-2 text-xs font-black uppercase tracking-tighter opacity-40">{convPage + 1} / {Math.ceil(convTotal / 20)}</span>
                                            <button disabled={(convPage + 1) * 20 >= convTotal} onClick={() => setConvPage(p => p + 1)} className="px-4 py-2 rounded-full border border-foreground/10 text-xs font-black uppercase tracking-tighter disabled:opacity-20 hover:bg-foreground/5 transition-colors">Next →</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── API Docs ──────────────────────────────────── */}
                    {tab === "docs" && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tighter">API Reference</h1>
                                <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Integrate OmniChat into any product</p>
                            </div>

                            {/* Endpoint cards */}
                            {[
                                {
                                    method: "POST", endpoint: "/api/v1/chat",
                                    title: "Send a Message",
                                    desc: "Send a user message to an OmniChat project. The AI will respond using the project's knowledge base and context.",
                                    auth: "x-api-key header (your project API key)",
                                    body: `{\n  "messages": [\n    { "role": "user", "content": "What are your office hours?" }\n  ],\n  "userId": "visitor-abc123"  // optional\n}`,
                                    response: `{\n  "content": "Our office is open Mon-Fri, 9am to 6pm.",\n  "usage": { "tokens": 42 }\n}`,
                                    code: `fetch("https://universal-chatbot-psi.vercel.app/api/v1/chat", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "x-api-key": "YOUR_API_KEY"\n  },\n  body: JSON.stringify({\n    messages: [{ role: "user", content: "Hello!" }]\n  })\n}).then(r => r.json()).then(console.log);`,
                                },
                            ].map((ep, i) => (
                                <div key={i} className="rounded-3xl border border-foreground/10 overflow-hidden">
                                    <div className="p-6 border-b border-foreground/10 flex items-center gap-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">{ep.method}</span>
                                        <code className="text-sm font-black opacity-60">{ep.endpoint}</code>
                                    </div>
                                    <div className="p-6 grid md:grid-cols-2 gap-8">
                                        <div className="space-y-5">
                                            <div>
                                                <h3 className="text-lg font-black uppercase tracking-tighter mb-2">{ep.title}</h3>
                                                <p className="text-sm opacity-50 leading-relaxed">{ep.desc}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Authentication</p>
                                                <p className="text-xs font-bold opacity-60 bg-foreground/5 px-3 py-2 rounded-xl">{ep.auth}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Request Body</p>
                                                <CodeBlock code={ep.body} lang="json" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Response</p>
                                                <CodeBlock code={ep.response} lang="json" />
                                            </div>
                                        </div>
                                        <div className="space-y-5">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">JavaScript Example</p>
                                                <CodeBlock code={ep.code} lang="javascript" />
                                            </div>
                                            {projects.length > 0 && (
                                                <div className="rounded-2xl bg-accent/5 border border-accent/20 p-4 space-y-3">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-accent">Your Projects</p>
                                                    {projects.map(p => (
                                                        <div key={p.id} className="flex items-center justify-between">
                                                            <span className="text-xs font-bold opacity-60">{p.name}</span>
                                                            <button onClick={() => copyKey(p.apiKey)} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                                                                {copiedKey === p.apiKey ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                                                Copy Key
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* SDK section */}
                            <div className="rounded-3xl border border-foreground/10 p-8 space-y-6">
                                <h2 className="text-xl font-black uppercase tracking-tighter">Web SDK</h2>
                                <p className="text-sm opacity-50 leading-relaxed">Embed the OmniChat widget directly into any website with a single script tag. The widget uses Shadow DOM for full CSS isolation.</p>
                                <CodeBlock lang="html" code={`<!-- Add to your HTML <head> -->\n<script>\n  window.OmniChatConfig = {\n    apiKey: "YOUR_API_KEY",\n    primaryColor: "#3b82f6",\n    position: "bottom-right"\n  };\n</script>\n<script src="https://universal-chatbot-psi.vercel.app/embed/widget.js" async></script>`} />
                                <div className="grid md:grid-cols-3 gap-4 pt-2">
                                    {[
                                        { label: "apiKey", type: "string", desc: "Your project API key" },
                                        { label: "primaryColor", type: "string", desc: "Hex color for chat bubble" },
                                        { label: "position", type: "string", desc: '"bottom-right" or "bottom-left"' },
                                    ].map(opt => (
                                        <div key={opt.label} className="p-4 rounded-2xl bg-foreground/5">
                                            <code className="text-xs font-black">{opt.label}</code>
                                            <span className="text-[10px] opacity-40 ml-2">{opt.type}</span>
                                            <p className="text-[10px] opacity-50 mt-1">{opt.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rate limits */}
                            <div className="rounded-3xl border border-foreground/10 p-8 space-y-5">
                                <h2 className="text-xl font-black uppercase tracking-tighter">Rate Limits &amp; Plans</h2>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {[
                                        { plan: "Free", tokens: "10,000 / mo", rpm: "10 req/min", color: "border-foreground/10" },
                                        { plan: "Pro", tokens: "100,000 / mo", rpm: "60 req/min", color: "border-accent/50", active: true },
                                        { plan: "Enterprise", tokens: "Unlimited", rpm: "Unlimited", color: "border-foreground/10" },
                                    ].map(pl => (
                                        <div key={pl.plan} className={`p-5 rounded-2xl border ${pl.color} ${pl.active ? "bg-accent/5" : ""}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-xs font-black uppercase tracking-tighter">{pl.plan}</span>
                                                {pl.active && <span className="text-[9px] font-black uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded-full">Your Plan</span>}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-xs opacity-60"><span className="font-black opacity-100">{pl.tokens}</span> tokens</div>
                                                <div className="text-xs opacity-60"><span className="font-black opacity-100">{pl.rpm}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                </div>
            </main>
        </div>
    );
}
