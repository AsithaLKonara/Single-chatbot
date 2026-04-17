"use client";

import { ChatWidget } from "@/components/chat-widget";

export default function ChatPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <header className="px-6 py-4 border-b border-foreground/10">
                <h1 className="text-lg font-black uppercase tracking-tight">OmniChat</h1>
            </header>
            <div className="p-6">
                <p className="text-sm opacity-60">Context-aware chatbot for this single application.</p>
            </div>
            <ChatWidget defaultOpen primaryColor="#3b82f6" />
        </main>
    );
}
