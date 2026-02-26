"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        supabase.from("projects").select("*").then(({ data }) => setProjects(data || []));
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">OmniChat Admin</h1>
            <div className="grid gap-4">
                {projects.map((p) => (
                    <div key={p.id} className="p-4 border rounded-lg shadow-sm">
                        <h2 className="font-semibold">{p.name}</h2>
                        <code className="text-xs bg-zinc-100 p-1 rounded mt-2 block">{p.id}</code>
                    </div>
                ))}
            </div>
        </div>
    );
}
