"use client";
import { useEffect, useState, useCallback } from "react";
import {
    LayoutDashboard, FolderOpen, MessageSquare, BookOpen, Key,
    Plus, Trash2, Copy, Check, ChevronRight, Globe, Cpu,
    TrendingUp, Zap, Command, LogOut, X, AlertCircle, RefreshCw, Send, FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Project { id: string; name: string; apiKey: string; conversations: number; tokens: number; createdAt: string; }
interface Conversation { id: string; projectId: string; userId: string; message: string; response: string; createdAt: string; project: { name: string }; }
interface Knowledge { id: string; content: string; createdAt: string; }
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
    { id: "knowledge", icon: BookOpen, label: "Knowledge" },
    { id: "conversations", icon: MessageSquare, label: "Logs" },
    { id: "docs", icon: Key, label: "API Docs" },
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
    const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
    const [convTotal, setConvTotal] = useState(0);
    const [convPage, setConvPage] = useState(0);
    const [filterProject, setFilterProject] = useState<string>("");
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newProjectName, setNewProjectName] = useState("");
    const [creatingProject, setCreatingProject] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [newKnowledge, setNewKnowledge] = useState("");
    const [addingKnowledge, setAddingKnowledge] = useState(false);

    // ── Fetch dashboard overview ──────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/login"); return; }
        try {
            const res = await fetch("/api/user/dashboard", { headers: authHeaders() });
            if (res.status === 401) { localStorage.removeItem("token"); router.push("/login"); return; }
            if (!res.ok) throw new Error("Connection Failure");
            const json = await res.json();
            setData(json);
            setProjects(json.projects || []);
            if (json.projects.length > 0 && !selectedProjectId) {
                setSelectedProjectId(json.projects[0].id);
            }
        } catch (e: any) { setError(e.message); }
        finally { setLoadingData(false); }
    }, [router, selectedProjectId]);

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

    // ── Fetch knowledge ───────────────────────────────────────────────────────
    const fetchKnowledge = useCallback(async (projectId: string) => {
        if (!projectId) return;
        try {
            const res = await fetch(`/api/user/knowledge?projectId=${projectId}`, { headers: authHeaders() });
            const json = await res.json();
            setKnowledge(json || []);
        } catch {}
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { if (tab === "conversations") fetchConversations(convPage, filterProject); }, [tab, convPage, filterProject, fetchConversations]);
    useEffect(() => { if (tab === "knowledge" && selectedProjectId) fetchKnowledge(selectedProjectId); }, [tab, selectedProjectId, fetchKnowledge]);

    // ── Project Actions ──────────────────────────────────────────────────────
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

    const deleteProject = async (id: string) => {
        if (!confirm("Permanently destroy this module and all its data?")) return;
        await fetch(`/api/user/projects?id=${id}`, { method: "DELETE", headers: authHeaders() });
        setProjects(prev => prev.filter(p => p.id !== id));
        if (selectedProject?.id === id) setSelectedProject(null);
        fetchData();
    };

    // ── Knowledge Actions ────────────────────────────────────────────────────
    const addKnowledge = async () => {
        if (!newKnowledge.trim() || !selectedProjectId) return;
        setAddingKnowledge(true);
        try {
            const res = await fetch("/api/user/knowledge", {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ projectId: selectedProjectId, content: newKnowledge }),
            });
            if (res.ok) {
                const k = await res.json();
                setKnowledge(prev => [k, ...prev]);
                setNewKnowledge("");
            }
        } finally { setAddingKnowledge(false); }
    };

    const removeKnowledge = async (id: string) => {
        await fetch(`/api/user/knowledge?id=${id}`, { method: "DELETE", headers: authHeaders() });
        setKnowledge(prev => prev.filter(k => k.id !== id));
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
                <p className="text-xs font-black uppercase tracking-widest">Initializing Module...</p>
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
            <aside className="w-16 md:w-60 border-r border-foreground/10 flex flex-col py-6 px-3 md:px-5 gap-2 sticky top-0 h-screen overflow-y-auto overflow-x-hidden">
                <div className="flex items-center gap-3 mb-8 px-1">
                    <div className="w-8 h-8 bg-foreground text-background rounded-xl flex items-center justify-center flex-shrink-0">
                        <Command size={16} />
                    </div>
                    <span className="hidden md:block text-sm font-black tracking-tighter uppercase">OmniChat AI</span>
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
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-1">Authenticated</p>
                        <p className="text-xs font-bold truncate opacity-70">{data.user.email}</p>
                        <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest bg-accent/10 text-accent px-2 py-0.5 rounded-full">{data.user.plan}</span>
                    </div>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl opacity-30 hover:opacity-100 hover:text-red-500 transition-all">
                        <LogOut size={18} className="flex-shrink-0" />
                        <span className="hidden md:block text-xs font-black uppercase tracking-tight">System Out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────── */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">

                    {/* ── Overview ──────────────────────────────────── */}
                    {tab === "overview" && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-4xl font-black uppercase tracking-tightest">Dashboard.</h1>
                                    <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Holistic View · {projects.length} Nodes Online</p>
                                </div>
                                <button
                                    onClick={() => { setTab("projects"); setShowCreate(true); }}
                                    className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-black text-xs uppercase tracking-tighter shadow-xl hover:scale-105 transition-transform"
                                >
                                    <Plus size={14} /> Initialize Node
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { icon: FolderOpen, label: "Active Nodes", value: projects.length, sub: "Modules deployed" },
                                    { icon: TrendingUp, label: "Throughput", value: fmt(data.usage.total), sub: "Tokens processed" },
                                    { icon: Zap, label: "Traffic / 24h", value: fmt(data.usage.daily), sub: "Total interactions" },
                                    { icon: Cpu, label: "Neural Load", value: `${saturation}%`, sub: `of ${fmt(data.usage.limit)} total` },
                                ].map((s, i) => (
                                    <div key={i} className="p-6 rounded-[32px] border border-foreground/10 space-y-4 hover:border-foreground/30 transition-all group nano-glass">
                                        <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                            <s.icon size={18} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-3xl font-black tracking-tighter">{s.value}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-30">{s.label}</div>
                                            <div className="text-[9px] opacity-20 uppercase tracking-widest font-bold">{s.sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 rounded-[40px] border border-foreground/10 space-y-4 nano-glass">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                                    <span>Plan Utilization Index</span>
                                    <span>{saturation}%</span>
                                </div>
                                <div className="h-2.5 bg-foreground/5 rounded-full overflow-hidden p-0.5 border border-foreground/10">
                                    <div
                                        className="h-full bg-accent rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                                        style={{ width: `${saturation}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] opacity-20 font-bold uppercase tracking-widest">
                                    <span>0.00 TPS</span><span>{fmt(data.usage.limit)} MAX</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 px-2">Top Performance Modules</h3>
                                {projects.length === 0 ? (
                                    <div className="rounded-[40px] border border-dashed border-foreground/10 p-16 text-center opacity-30">
                                        <Globe size={40} className="mx-auto mb-5" />
                                        <p className="text-xs font-black uppercase tracking-widest leading-loose">No active neural nodes discovered.<br/>Initialize a project to stabilize synchronization.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {projects.slice(0, 3).map(p => (
                                            <div
                                                key={p.id}
                                                className="flex items-center justify-between p-6 rounded-3xl border border-foreground/10 hover:border-foreground/30 transition-all bg-foreground/[0.02] group"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
                                                        <FolderOpen size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black uppercase tracking-tighter group-hover:text-accent transition-colors">{p.name}</p>
                                                        <div className="flex gap-4 items-center mt-1">
                                                            <p className="text-[10px] opacity-30 uppercase font-black tracking-widest">{p.conversations} LOGS</p>
                                                            <div className="w-1 h-1 rounded-full bg-foreground/10" />
                                                            <p className="text-[10px] opacity-30 uppercase font-black tracking-widest">{fmt(p.tokens)} TOKENS</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => { setSelectedProject(p); setTab("projects"); }}
                                                    className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-foreground hover:text-background transition-all"
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Projects ──────────────────────────────────── */}
                    {tab === "projects" && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-black uppercase tracking-tightest">Neural Nodes.</h1>
                                    <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Module Identity Management</p>
                                </div>
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-black text-xs uppercase tracking-tighter"
                                >
                                    <Plus size={14} /> New Module
                                </button>
                            </div>

                            <AnimatePresence>
                                {showCreate && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-8 rounded-[40px] border border-accent/20 bg-accent/[0.03] flex flex-col md:flex-row gap-6 items-center">
                                            <input
                                                autoFocus
                                                className="flex-1 bg-transparent border-b border-foreground/10 pb-2 text-xl font-black outline-none placeholder:opacity-20 uppercase tracking-tighter"
                                                placeholder="Identity Name..."
                                                value={newProjectName}
                                                onChange={e => setNewProjectName(e.target.value)}
                                                onKeyDown={e => e.key === "Enter" && createProject()}
                                            />
                                            <div className="flex gap-3 w-full md:w-auto">
                                                <button
                                                    onClick={createProject}
                                                    disabled={creatingProject || !newProjectName.trim()}
                                                    className="flex-1 md:flex-none px-8 py-3 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-tighter disabled:opacity-40"
                                                >
                                                    {creatingProject ? "..." : "Authorize"}
                                                </button>
                                                <button onClick={() => setShowCreate(false)} className="p-3 bg-foreground/5 rounded-2xl opacity-40 hover:opacity-100">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-4">
                                {projects.map(p => (
                                    <div key={p.id} className="space-y-3">
                                        <div
                                            className={`p-6 rounded-[32px] border transition-all flex items-center justify-between group ${
                                                selectedProject?.id === p.id ? "border-accent/40 bg-accent/[0.03]" : "border-foreground/10 hover:border-foreground/20 bg-foreground/[0.01]"
                                            }`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedProject?.id === p.id ? "bg-accent text-white" : "bg-foreground/5"}`}>
                                                    <Globe size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-base font-black uppercase tracking-tighter">{p.name}</p>
                                                    <div className="flex gap-4 items-center opacity-30 text-[10px] font-black uppercase tracking-widest mt-1">
                                                        <span>{timeAgo(p.createdAt)}</span>
                                                        <div className="w-1 h-1 rounded-full bg-current" />
                                                        <span>{p.conversations} Signals</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => { setSelectedProjectId(p.id); setTab("knowledge"); }}
                                                    className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity px-4 py-2 bg-foreground/5 rounded-xl"
                                                >
                                                    <BookOpen size={12} /> Knowledge
                                                </button>
                                                <button
                                                    onClick={() => setSelectedProject(selectedProject?.id === p.id ? null : p)}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center bg-foreground/5 transition-transform ${selectedProject?.id === p.id ? "rotate-90 text-accent" : ""}`}
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {selectedProject?.id === p.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.98, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                                    className="p-8 rounded-[40px] border border-foreground/10 bg-foreground/[0.02] space-y-8"
                                                >
                                                    <div className="grid md:grid-cols-2 gap-8">
                                                        <div className="space-y-6">
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-3 flex items-center gap-2"><Key size={12} /> Access Protocol</p>
                                                                <div className="group relative">
                                                                    <div className="flex items-center gap-4 bg-foreground/5 rounded-2xl px-5 py-4 border border-foreground/5">
                                                                        <code className="flex-1 text-xs font-bold opacity-60 truncate font-mono">{p.apiKey}</code>
                                                                        <button onClick={() => copyKey(p.apiKey)} className="hover:text-accent transition-colors">
                                                                            {copiedKey === p.apiKey ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Integration Metrics</p>
                                                                <div className="flex gap-4">
                                                                    <div className="flex-1 p-5 rounded-2xl bg-foreground/5 text-center">
                                                                        <div className="text-xl font-black">{fmt(p.tokens)}</div>
                                                                        <div className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-1">Processed</div>
                                                                    </div>
                                                                    <div className="flex-1 p-5 rounded-2xl bg-foreground/5 text-center">
                                                                        <div className="text-xl font-black">{p.conversations}</div>
                                                                        <div className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-1">Successful</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Live Implementation</p>
                                                            <CodeBlock lang="js" code={`fetch("/api/v1/chat", {\n  method: "POST",\n  headers: { "x-api-key": "${p.apiKey}" },\n  body: JSON.stringify({ messages: [] })\n})`} />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-6 border-t border-foreground/5">
                                                        <div className="flex gap-6">
                                                            <button onClick={() => { setFilterProject(p.id); setTab("conversations"); }} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-accent transition-all">
                                                                <MessageSquare size={14} /> Full Logs
                                                            </button>
                                                            <button onClick={() => { setSelectedProjectId(p.id); setTab("knowledge"); }} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-accent transition-all">
                                                                <BookOpen size={14} /> Knowledge Node
                                                            </button>
                                                        </div>
                                                        <button onClick={() => deleteProject(p.id)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 hover:text-red-500 transition-all">
                                                            <Trash2 size={14} /> Decommission
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Knowledge Management ─────────────────────────────── */}
                    {tab === "knowledge" && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-black uppercase tracking-tightest">Corpus.</h1>
                                    <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Neural Context Management</p>
                                </div>
                                <div className="flex gap-3">
                                    <select
                                        value={selectedProjectId}
                                        onChange={e => setSelectedProjectId(e.target.value)}
                                        className="bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-tighter outline-none min-w-[200px]"
                                    >
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Add Knowledge Input */}
                            <div className="p-8 rounded-[40px] border border-foreground/10 bg-foreground/[0.02] space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Ingest New Knowledge Stream</p>
                                <div className="space-y-4">
                                    <textarea
                                        className="w-full h-40 bg-foreground/5 border border-foreground/10 rounded-[32px] p-6 text-sm font-medium outline-none placeholder:opacity-20 resize-none focus:border-accent/40 transition-colors"
                                        placeholder="Paste documentation, FAQs, or raw context here... The AI will use this in real-time."
                                        value={newKnowledge}
                                        onChange={e => setNewKnowledge(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={addKnowledge}
                                            disabled={addingKnowledge || !newKnowledge.trim() || !selectedProjectId}
                                            className="px-8 py-4 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-tighter flex items-center gap-2 disabled:opacity-40 hover:scale-[1.02] transition-transform"
                                        >
                                            <Send size={14} /> {addingKnowledge ? "Processing..." : "Inject into Neural Node"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Knowledge List */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 px-2 flex items-center justify-between">
                                    <span>Active Context Streams</span>
                                    <span>{knowledge.length} Units</span>
                                </h3>
                                {knowledge.length === 0 ? (
                                    <div className="rounded-[40px] border border-dashed border-foreground/10 p-20 text-center opacity-30">
                                        <BookOpen size={40} className="mx-auto mb-5" />
                                        <p className="text-xs font-black uppercase tracking-widest">No knowledge units indexed for this node.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {knowledge.map(k => (
                                            <div key={k.id} className="p-6 rounded-3xl border border-foreground/10 bg-foreground/[0.01] hover:bg-foreground/[0.02] transition-all group relative">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2 opacity-30">
                                                        <FileText size={12} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{timeAgo(k.createdAt)}</span>
                                                    </div>
                                                    <button onClick={() => removeKnowledge(k.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-500 transition-all">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-sm opacity-70 line-clamp-3 leading-relaxed whitespace-pre-wrap">{k.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Conversation Logs ─────────────────────────── */}
                    {tab === "conversations" && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-4xl font-black uppercase tracking-tightest">Signals.</h1>
                                    <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Live Interaction Stream</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <select
                                        value={filterProject}
                                        onChange={e => { setFilterProject(e.target.value); setConvPage(0); }}
                                        className="bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-tighter outline-none"
                                    >
                                        <option value="">ALL NODES</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <button onClick={() => fetchConversations(convPage, filterProject)} className="p-2.5 bg-foreground/5 rounded-xl opacity-40 hover:opacity-100 transition-opacity">
                                        <RefreshCw size={16} />
                                    </button>
                                </div>
                            </div>

                            {conversations.length === 0 ? (
                                <div className="rounded-[40px] border border-dashed border-foreground/10 p-20 text-center opacity-30">
                                    <MessageSquare size={40} className="mx-auto mb-5" />
                                    <p className="text-xs font-black uppercase tracking-widest">No active communication signals detected.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {conversations.map(c => (
                                        <div key={c.id} className="p-8 rounded-[32px] border border-foreground/10 space-y-6 bg-foreground/[0.01] hover:border-foreground/30 transition-all group overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">{c.project.name}</span>
                                                </div>
                                                <span className="text-[10px] opacity-30 font-bold uppercase tracking-widest font-mono">{timeAgo(c.createdAt)}</span>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex gap-5">
                                                    <div className="w-8 h-8 rounded-full bg-foreground/5 flex-shrink-0 flex items-center justify-center text-[10px] font-black opacity-30">URS</div>
                                                    <p className="text-sm font-medium opacity-90 leading-relaxed pt-1.5">{c.message}</p>
                                                </div>
                                                <div className="flex gap-5">
                                                    <div className="w-8 h-8 rounded-full bg-accent/20 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-accent shadow-[0_0_10px_rgba(59,130,246,0.2)]">AI</div>
                                                    <p className="text-sm font-medium opacity-60 leading-relaxed pt-1.5">{c.response}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {convTotal > 20 && (
                                        <div className="flex justify-center gap-3 pt-8">
                                            <button disabled={convPage === 0} onClick={() => setConvPage(p => p - 1)} className="px-6 py-3 rounded-2xl border border-foreground/10 text-xs font-black uppercase tracking-tighter disabled:opacity-20 hover:bg-foreground/5 transition-colors">Prev</button>
                                            <span className="flex items-center px-4 text-xs font-black uppercase tracking-tighter opacity-30">{convPage + 1} / {Math.ceil(convTotal / 20)}</span>
                                            <button disabled={(convPage + 1) * 20 >= convTotal} onClick={() => setConvPage(p => p + 1)} className="px-6 py-3 rounded-2xl border border-foreground/10 text-xs font-black uppercase tracking-tighter disabled:opacity-20 hover:bg-foreground/5 transition-colors">Next</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── API Docs ──────────────────────────────────── */}
                    {tab === "docs" && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-20">
                            <div>
                                <h1 className="text-4xl font-black uppercase tracking-tightest">Synthetics.</h1>
                                <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Integration Protocol &amp; SDK Guidance</p>
                            </div>

                            {/* Public SDK */}
                            <div className="p-10 rounded-[40px] border-2 border-accent/20 bg-accent/[0.03] space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] pointer-events-none" />
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Globe size={24} className="text-accent" />
                                        <h2 className="text-2xl font-black uppercase tracking-tighter">Universal UI SDK</h2>
                                    </div>
                                    <p className="text-sm opacity-60 leading-relaxed max-w-2xl">Deploy the OmniChat neural interface onto any web environment using a single script tag. The widget operates within a Shadow DOM for zero-latency CSS isolation.</p>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Add to &lt;head&gt; or &lt;body&gt;</span>
                                        </div>
                                        <CodeBlock lang="html" code={`<script>\n  window.OmniChatConfig = {\n    apiKey: "${projects[0]?.apiKey || "YOUR_API_KEY"}",\n    primaryColor: "#3b82f6"\n  };\n</script>\n<script src="https://universal-chatbot-psi.vercel.app/widget.js" async></script>`} />
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4 pt-4">
                                        {[
                                            { label: "apiKey", type: "string", desc: "Project specific identifier" },
                                            { label: "primaryColor", type: "hex", desc: "UI primary brand color" },
                                            { label: "position", type: "enum", desc: "bottom-right | bottom-left" },
                                        ].map(opt => (
                                            <div key={opt.label} className="p-5 rounded-2xl bg-foreground/5 space-y-1 border border-foreground/5">
                                                <code className="text-xs font-black text-accent">{opt.label}</code>
                                                <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{opt.type}</p>
                                                <p className="text-[11px] opacity-40 leading-relaxed mt-1">{opt.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Endpoint cards */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 px-2">Neural API Reference</h3>
                                {[
                                    {
                                        method: "POST", endpoint: "/api/v1/chat",
                                        title: "Sync Intelligence",
                                        desc: "Atomic POST request to the neural processing cluster. Returns AI inference based on project context.",
                                        auth: "x-api-key head authorization",
                                        body: `{\n  "messages": [\n    { "role": "user", "content": "What's the status?" }\n  ],\n  "userId": "system-user-01"\n}`,
                                        response: `{\n  "content": "All systems operational.",\n  "usage": { "tokens": 24 }\n}`,
                                        code: `fetch("https://universal-chatbot-psi.vercel.app/api/v1/chat", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "x-api-key": "YOUR_API_KEY"\n  },\n  body: JSON.stringify({\n    messages: [{ role: "user", content: "Query" }]\n  })\n})`,
                                    },
                                ].map((ep, i) => (
                                    <div key={i} className="rounded-[40px] border border-foreground/10 overflow-hidden nano-glass">
                                        <div className="p-8 border-b border-foreground/10 flex items-center gap-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-4 py-2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.2)]">{ep.method}</span>
                                            <code className="text-sm font-black opacity-60 tracking-widest font-mono">{ep.endpoint}</code>
                                        </div>
                                        <div className="p-10 grid md:grid-cols-2 gap-12">
                                            <div className="space-y-8">
                                                <div>
                                                    <h3 className="text-2xl font-black uppercase tracking-tightest mb-3">{ep.title}</h3>
                                                    <p className="text-sm opacity-50 leading-relaxed">{ep.desc}</p>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="p-5 rounded-2xl bg-foreground/5 border border-foreground/5 space-y-1">
                                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">Auth Header</p>
                                                        <p className="text-xs font-bold opacity-80">x-api-key: [Your Module Token]</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1">Payload Schema</p>
                                                        <CodeBlock code={ep.body} lang="json" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-8">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">Response Sample</p>
                                                    <CodeBlock code={ep.response} lang="json" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">Implementation Logic</p>
                                                    <CodeBlock code={ep.code} lang="js" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                </div>
            </main>
        </div>
    );
}
