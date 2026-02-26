"use client";
import { useState } from "react";
import { Copy, Terminal, Check } from "lucide-react";

export default function DocsPage() {
    const [copied, setCopied] = useState(false);

    const copyCode = (txt: string) => {
        navigator.clipboard.writeText(txt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const codeSamples = {
        curl: `curl -X POST https://omnichat.ai/api/v1/chat \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [{ "role": "user", "content": "How do I integrate this?" }]
  }'`,
        js: `const response = await fetch("https://omnichat.ai/api/v1/chat", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Hello!" }]
  })
});
const data = await response.json();`,
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-10 max-w-5xl mx-auto">
            <header className="mb-20">
                <h1 className="text-4xl font-black mb-4">API Documentation</h1>
                <p className="text-zinc-500 text-lg">Integrate the most powerful context-aware AI into your platform.</p>
            </header>

            <div className="grid md:grid-cols-[1fr_350px] gap-16">
                <div className="space-y-20">
                    <section>
                        <h2 className="text-2xl font-bold mb-6">Authentication</h2>
                        <p className="text-zinc-500 mb-6 leading-relaxed">
                            All API requests must include your project key in the <code className="bg-white/5 px-2 py-1 rounded text-blue-400">x-api-key</code> header.
                            You can find your keys in the dashboard under the project settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6">Chat Completion <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded ml-2 uppercase">Post</span></h2>
                        <p className="text-zinc-500 mb-6 leading-relaxed">
                            Send an array of messages to get an intelligent response based on your project's knowledge base.
                        </p>
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-4">Request Body</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-sm font-bold text-zinc-300">messages</span>
                                    <span className="text-xs text-zinc-500 italic">Array (Required)</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-sm font-bold text-zinc-300">userId</span>
                                    <span className="text-xs text-zinc-500 italic">String (Optional)</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6">Error Codes</h2>
                        <div className="grid gap-4">
                            {[
                                { code: 401, msg: "Unauthorized - API key missing or invalid." },
                                { code: 402, msg: "Payment Required - Token limit reached." },
                                { code: 429, msg: "Too Many Requests - Rate limit exceeded." }
                            ].map((e, i) => (
                                <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                    <span className="text-sm font-bold text-red-400">{e.code}</span>
                                    <span className="text-sm text-zinc-500">{e.msg}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="sticky top-10 space-y-6">
                    <div className="bg-zinc-900 border border-white/10 rounded-[24px] overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center text-xs font-bold text-zinc-500 uppercase">
                            <div className="flex items-center gap-2"><Terminal size={14} /> Example cURL</div>
                            <button onClick={() => copyCode(codeSamples.curl)} className="hover:text-blue-500 transition-colors">
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                        <pre className="p-6 text-xs leading-6 overflow-x-auto text-blue-300">
                            {codeSamples.curl}
                        </pre>
                    </div>

                    <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-[24px]">
                        <h4 className="text-sm font-bold mb-2">SDK Integration</h4>
                        <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                            We also offer a direct JS SDK which handles UI and context automatically.
                        </p>
                        <button className="w-full py-3 bg-blue-600 rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors">Explore SDK</button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
