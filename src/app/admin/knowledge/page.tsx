"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  Database, 
  Check,
  AlertCircle
} from "lucide-react";

export default function KnowledgeBasePage() {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleAdd = async () => {
    if (!newContent.trim()) return;
    setStatus("loading");
    
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        body: JSON.stringify({ content: newContent }),
      });
      
      if (res.ok) {
        setStatus("success");
        setNewContent("");
        setTimeout(() => {
          setIsAdding(false);
          setStatus("idle");
        }, 2000);
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Knowledge Base</h2>
          <p className="text-white/50 text-sm mt-1">Manage the context and data your AI agent uses for RAG.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-3 rounded-2xl flex items-center space-x-2 font-bold transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          <span>Add Knowledge</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center space-x-3 focus-within:border-purple-500/50 transition-colors">
          <Search size={18} className="text-white/30" />
          <input 
            type="text" 
            placeholder="Search policies, FAQs, product info..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-white/20"
          />
        </div>
        <select className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white/70 outline-none">
          <option>All Types</option>
          <option>Policies</option>
          <option>Product Info</option>
          <option>FAQs</option>
        </select>
      </div>

      {/* Add Knowledge Modal (Simple inline for now) */}
      {isAdding && (
        <div className="bg-white/5 border border-purple-500/30 rounded-3xl p-8 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">New Knowledge Entry</h3>
            <button onClick={() => setIsAdding(false)} className="text-white/30 hover:text-white">Close</button>
          </div>
          <textarea 
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Paste text content here. It will be automatically vectorized for semantic search."
            className="w-full h-40 bg-[#0e0918] border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-purple-500 transition-colors"
          />
          <div className="flex items-center justify-end space-x-4">
            <button 
              disabled={status === "loading"}
              onClick={handleAdd}
              className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-white/90 disabled:opacity-50 flex items-center space-x-2"
            >
              {status === "loading" ? "Processing..." : status === "success" ? <><Check size={18}/><span>Added</span></> : "Vectorize & Add"}
            </button>
          </div>
          {status === "error" && (
            <div className="text-red-400 text-xs flex items-center space-x-1">
              <AlertCircle size={14} />
              <span>Failed to add entry. Check API logs.</span>
            </div>
          )}
        </div>
      )}

      {/* Knowledge List */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 text-white/30 text-[10px] uppercase font-bold tracking-widest">
              <th className="px-8 py-4">Content Preview</th>
              <th className="px-8 py-4">Type</th>
              <th className="px-8 py-4">Created</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <KnowledgeRow 
              preview="Shipping Policy: We offer free delivery for orders above Rs. 5000. Standard delivery takes 2-4 business days."
              type="Policy"
              date="2026-04-18"
            />
            <KnowledgeRow 
              preview="Nike Air Max 270: Features a large Max Air unit for responsive cushioning. Available in 5 colors."
              type="Product"
              date="2026-04-19"
            />
            <KnowledgeRow 
              preview="FAQ: Can I return my order? Yes, within 7 days of delivery as long as the items are unworn."
              type="FAQ"
              date="2026-04-20"
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KnowledgeRow({ preview, type, date }: { preview: string; type: string; date: string }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
      <td className="px-8 py-4">
        <div className="flex items-center space-x-3">
          <FileText size={18} className="text-white/20" />
          <span className="line-clamp-1 text-white/80">{preview}</span>
        </div>
      </td>
      <td className="px-8 py-4">
        <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-[10px] font-bold text-white/50">
          {type}
        </span>
      </td>
      <td className="px-8 py-4 text-white/40 text-xs font-medium">
        {date}
      </td>
      <td className="px-8 py-4 text-right">
        <button className="p-2 text-white/20 hover:text-red-400 transition-colors">
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}
