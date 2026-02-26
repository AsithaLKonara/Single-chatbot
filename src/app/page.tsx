import { ChatWidget } from "@/components/chat-widget";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24 bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-950 dark:to-zinc-900 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />

      <div className="z-10 max-w-5xl w-full text-center">
        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight">
          OmniChat AI
        </h1>
        <p className="mt-6 text-zinc-500 text-xl font-medium max-w-2xl mx-auto">
          Quantum-grade context-aware intelligence for your modern web application.
          Seamless glassmorphism UI. Zero conflict integration.
        </p>

        <div className="mt-10 flex gap-4 justify-center">
          <div className="px-6 py-3 bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm text-sm font-semibold text-zinc-800">
            Phase 8: Production Ready
          </div>
          <div className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20 text-sm font-bold">
            Get Started
          </div>
        </div>
      </div>

      <ChatWidget primaryColor="#2563eb" />
    </main>
  );
}
