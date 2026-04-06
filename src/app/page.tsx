"use client";
import { Navbar, Section, NanoCard } from "@/components/ui-nano";
import { ChatWidget } from "@/components/chat-widget";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Layers, ShieldCheck, Globe, Zap, Code, Terminal, Database, MessageSquare, Check, Command } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-background selection:bg-accent selection:text-white">
      <Navbar />
      
      <div className="moving-bg" />

      {/* Hero Section */}
      <Section className="min-h-screen flex items-center pt-32 md:pt-0 nano-gradient relative">
        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-accent mb-10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            System Live: v4.2.0-Neural
          </motion.div>
          
          <motion.h1
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-[140px] font-black tracking-tightest leading-[0.85] mb-10 uppercase"
          >
            Universal <br /> <span className="opacity-15">Cognition.</span>
          </motion.h1>
          
          <motion.p
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-lg md:text-2xl font-bold max-w-2xl opacity-40 mb-14 leading-tight uppercase tracking-tighter"
          >
            The world's first context-autonomous AI interface. Embed 20+ years of domain intelligence in 60 seconds.
          </motion.p>
          
          <motion.div
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-6"
          >
            <Link href="/register" className="px-12 py-6 bg-foreground text-background font-black text-xs uppercase tracking-widest rounded-full flex items-center justify-center gap-3 group shadow-2xl hover:scale-105 transition-transform active:scale-95">
              Acquire Access <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#protocol" className="px-12 py-6 border-2 border-foreground/10 hover:border-foreground/30 font-black text-xs uppercase tracking-widest rounded-full flex items-center justify-center gap-3 transition-all backdrop-blur-sm">
              Explore Protocol <Terminal size={18} />
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* Grid Features */}
      <Section id="features" className="py-40">
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: Database, label: "Context Sync", text: "Zero-latency synchronization with your private knowledge corpus.", color: "text-blue-500" },
            { icon: Layers, label: "Neural SDK", text: "Shadow DOM isolation. Complete CSS independence for web environments.", color: "text-purple-500" },
            { icon: ShieldCheck, label: "Secure Ops", text: "Enterprise-grade encryption with sub-second inference protocols.", color: "text-emerald-500" },
            { icon: MessageSquare, label: "Fluid Logic", text: "Auto-adapts to your application environment and user behavior.", color: "text-orange-500" }
          ].map((f, i) => (
            <NanoCard key={i} className="hover:scale-102 hover:border-foreground/20 transition-all group p-10 bg-foreground/[0.01]">
              <div className={`p-4 rounded-2xl bg-foreground/5 w-fit mb-10 transition-all group-hover:scale-110 group-hover:bg-foreground/10 ${f.color}`}>
                <f.icon size={26} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tightest mb-4">{f.label}</h3>
              <p className="opacity-30 text-xs font-bold leading-relaxed uppercase tracking-tighter">{f.text}</p>
            </NanoCard>
          ))}
        </div>
      </Section>

      {/* SDK Sneak Peek */}
      <Section id="protocol" className="py-40 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-20 items-center">
          <div className="flex-1 space-y-10">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tightest leading-none">
              Single Script. <br/> <span className="opacity-20 italic">Global Mind.</span>
            </h2>
            <p className="text-lg font-bold opacity-30 leading-relaxed uppercase tracking-tighter max-w-lg">
              One script tag connects your entire application context to our decentralized intelligence cluster.
            </p>
            <div className="space-y-4">
              {[
                "Automatic Page Context Awareness",
                "Instant Vector-Index Search",
                "Sub-600ms Response Latency",
                "Custom Branding Injection"
              ].map(item => (
                <div key={item} className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                  <Check size={16} className="text-accent" /> {item}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="p-8 md:p-12 rounded-[50px] bg-foreground text-background shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 blur-[80px] pointer-events-none group-hover:bg-accent/40 transition-all" />
              <div className="flex gap-2 mb-8">
                <div className="w-2 h-2 rounded-full bg-background/20" />
                <div className="w-2 h-2 rounded-full bg-background/20" />
                <div className="w-2 h-2 rounded-full bg-background/20" />
              </div>
              <pre className="text-xs md:text-sm font-mono font-bold leading-relaxed opacity-80 whitespace-pre-wrap">
                <code>{`<!-- OmniChat Universal Node -->\n<script src="https://omnichat.ai/v4.js" async />\n<script>\n  OmniChat.init({\n    apiKey: "oc_live_9a23b...",\n    context: "auto",\n    theme: "synthetic"\n  });\n</script>`}</code>
              </pre>
            </div>
          </div>
        </div>
      </Section>

      {/* Resource Allocation */}
      <Section id="pricing" className="py-40 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-6">Execution Thresholds</p>
        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tightest mb-24">Scale with Intelligence.</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { tier: "FREE TIER", price: "0", features: ["1,000 Signals/mo", "Single Node", "Standard Latency"] },
            { tier: "PRO MODULE", price: "49", active: true, features: ["50,000 Signals/mo", "Multi-Node Support", "Priority Execution", "Custom Training"] },
            { tier: "CORE SYSTEMS", price: "199", features: ["Unlimited Signals", "Full Neural API", "Dedicated VPC", "24/7 Ops Support"] }
          ].map((p, i) => (
            <div key={i} className={`p-12 rounded-[40px] border-2 transition-all text-left flex flex-col h-full ${p.active ? "border-accent bg-accent/[0.02] shadow-[0_20px_50px_rgba(59,130,246,0.1)] scale-105 relative z-10" : "border-foreground/10 hover:border-foreground/20"}`}>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 opacity-40">{p.tier}</h4>
              <div className="text-6xl font-black tracking-tightest mb-10">
                <span className="text-2xl align-top mr-1 font-black leading-none">$</span>{p.price}
              </div>
              <div className="flex-1 space-y-4 mb-12">
                {p.features.map(f => (
                  <div key={f} className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-current opacity-40" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center transition-all ${p.active ? "bg-accent text-white shadow-lg shadow-accent/20 hover:scale-[1.02]" : "border-2 border-foreground/10 hover:bg-foreground hover:text-background"}`}>
                Initialize Account
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-foreground/10 text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <Command size={20} />
            <span className="text-xs font-black uppercase tracking-widest">OMNICHAT Systems Ltd.</span>
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest opacity-30">
            <Link href="#" className="hover:opacity-100 transition-opacity">Protocol</Link>
            <Link href="#" className="hover:opacity-100 transition-opacity">Nexus</Link>
            <Link href="#" className="hover:opacity-100 transition-opacity">Terms</Link>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-15">
            SINCE 2025. ALL RIGHTS AUTHORIZED.
          </div>
        </div>
      </footer>

      <ChatWidget primaryColor="#3b82f6" />
    </div>
  );
}
