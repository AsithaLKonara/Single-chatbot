"use client";

import { ChatWidget } from "@/components/chat-widget";
import Link from "next/link";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <header className="px-6 py-4 border-b border-foreground/10 flex items-center justify-between">
                <h1 className="text-lg font-black uppercase tracking-tight">OmniChat</h1>
                <Link href="/chat" className="text-sm font-semibold opacity-80 hover:opacity-100">
                    Open Full Chat
                </Link>
            </header>
            <section className="p-8 md:p-12">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight">AI Chatbot</h2>
                <p className="mt-4 text-base opacity-70 max-w-2xl">
                    Ask anything using the popup button in the bottom-right corner.
                </p>
            </section>

            <ChatWidget primaryColor="#3b82f6" />
        </main>
    );
}
