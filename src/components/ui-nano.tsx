"use client";
import Link from "next/link";
import type { ReactNode } from "react";

export const Navbar = () => (
    <nav className="fixed top-0 w-full z-[100] nano-glass h-16 border-b-0">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
            <Link href="/" className="text-sm font-black tracking-tighter uppercase">OmniChat</Link>
            <div className="flex items-center gap-8">
                <Link href="/chat" className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity uppercase tracking-widest">Chat</Link>
            </div>
        </div>
    </nav>
);

type SectionProps = { children: ReactNode; id?: string; className?: string };
type NanoCardProps = { children: ReactNode; className?: string };

export const Section = ({ children, id, className }: SectionProps) => (
    <section id={id} className={`py-40 px-6 relative overflow-hidden ${className}`}>
        <div className="moving-bg" />
        <div className="max-w-7xl mx-auto relative z-10">{children}</div>
    </section>
);

export const NanoCard = ({ children, className }: NanoCardProps) => (
    <div className={`p-8 rounded-3xl nano-glass nano-card-glow ${className}`}>
        {children}
    </div>
);
