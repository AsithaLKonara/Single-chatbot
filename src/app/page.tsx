import { ChatWidget } from "@/components/chat-widget";
import Link from "next/link";
import { Zap, Shield, BarChart3, Rocket, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">OmniChat AI</div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="bg-white text-black text-sm font-bold px-4 py-2 rounded-full hover:bg-zinc-200 transition-all">Get Started</Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full -z-10" />
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">Quantum Intelligence <br /> for <span className="text-blue-500">Universal Apps</span></h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Integrate context-aware AI in minutes. Professional glassmorphism,
            semantic retrieval, and enterprise-grade scalability in a single SDK.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 group transition-all">
              Start Free Trial <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/docs" className="bg-white/5 hover:bg-white/10 px-8 py-4 rounded-2xl font-bold border border-white/10 transition-all">
              View Documentation
            </Link>
          </div>
        </section>

        <section id="features" className="py-20 px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Micro-latency", text: "Powered by Groq Llama 3 for sub-second AI responses." },
            { icon: Shield, title: "Isolated Sandbox", text: "Shadow DOM injection ensures zero CSS conflicts." },
            { icon: BarChart3, title: "Usage Metering", text: "Granular token tracking and real-time usage analytics." }
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
              <f.icon className="text-blue-500 mb-6" size={32} />
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </section>

        <section id="pricing" className="py-20 px-6 text-center">
          <h2 className="text-4xl font-black mb-16">Simple Usage Plans</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: "Free", price: "0", features: ["1,000 tokens/mo", "1 Project", "Basic Chat"], btn: "Start Free" },
              { name: "Pro", price: "29", features: ["50,000 tokens/mo", "Unlimited Projects", "Context Awareness", "Vector Search"], btn: "Go Pro", highlight: true },
              { name: "Enterprise", price: "99", features: ["1,000,000 tokens/mo", "SLA Support", "SSO & Audit Logs", "Custom Models"], btn: "Contact Sales" }
            ].map((p, i) => (
              <div key={i} className={cn("p-10 rounded-[32px] border text-left flex flex-col", p.highlight ? "bg-blue-600 border-blue-500" : "bg-white/5 border-white/10")}>
                <h3 className="text-lg font-bold mb-2 opacity-80">{p.name}</h3>
                <div className="text-4xl font-black mb-6">${p.price}<span className="text-sm font-medium opacity-60">/mo</span></div>
                <div className="flex-1 space-y-4 mb-8">
                  {p.features.map((f, fi) => <div key={fi} className="flex items-center gap-2 text-sm opacity-80"><Zap size={14} /> {f}</div>)}
                </div>
                <button className={cn("w-full py-4 rounded-2xl font-bold transition-all", p.highlight ? "bg-white text-black hover:bg-zinc-200" : "bg-white/10 hover:bg-white/20 border border-white/10")}>{p.btn}</button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 text-center text-zinc-600 text-sm">
        &copy; 2025 OmniChat AI Corp. All rights reserved.
      </footer>

      <ChatWidget primaryColor="#3b82f6" />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
