"use client";

import { ChatWidget } from "@/components/chat-widget";
import Link from "next/link";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-[#0e0918] text-white selection:bg-purple-500/30">
            {/* Header */}
            <header className="px-10 py-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/20">O</div>
                    <h1 className="text-xl font-bold tracking-tight uppercase">OmniChat</h1>
                </div>
                <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-white/60">
                    <Link href="/admin/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                    <Link href="/admin/knowledge" className="hover:text-white transition-colors">Knowledge Base</Link>
                    <Link href="/chat" className="hover:text-white transition-colors">Public Chat</Link>
                </nav>
                <Link 
                    href="/admin/dashboard" 
                    className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-xl"
                >
                    Admin Console
                </Link>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-10 overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />

                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-purple-400">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        <span>Single Business Automation Agent</span>
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
                        Automate <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Business</span> <br />
                        Intelligence.
                    </h2>
                    <p className="text-lg text-white/50 max-w-2xl mx-auto font-medium">
                        A dedicated AI agent for your business. Integrated with WhatsApp, WooCommerce, and real-time tracking systems.
                    </p>
                    <div className="flex items-center justify-center space-x-4 pt-4">
                        <Link 
                            href="/admin/dashboard" 
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 shadow-2xl shadow-purple-500/20"
                        >
                            Enter Admin Console
                        </Link>
                        <Link 
                            href="/chat" 
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold transition-all"
                        >
                            Test Public Chat
                        </Link>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="px-10 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <FeatureCard 
                        title="WhatsApp Gateway" 
                        desc="Fully integrated with WhatsApp Business API for direct customer engagement."
                    />
                    <FeatureCard 
                        title="WooCommerce Sync" 
                        desc="Real-time product search, order status, and automated return processing."
                    />
                    <FeatureCard 
                        title="Semantic RAG" 
                        desc="Advanced vector knowledge base for accurate, grounded business responses."
                    />
                </div>
            </section>

            <footer className="px-10 py-12 border-t border-white/5 text-center text-white/20 text-xs font-bold uppercase tracking-widest">
                OmniChat &copy; 2024 &mdash; Dedicated Business Automation Agent
            </footer>

            <ChatWidget primaryColor="#8b5cf6" />
        </main>
    );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:bg-white/10 transition-colors cursor-default group">
            <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors">{title}</h3>
            <p className="text-sm text-white/40 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}
