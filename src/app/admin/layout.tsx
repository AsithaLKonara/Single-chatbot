import React from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Database, 
  ShoppingCart, 
  Settings, 
  LogOut 
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0e0918] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col p-6 space-y-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center font-bold">O</div>
          <span className="font-bold text-xl tracking-tight uppercase">OmniAdmin</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <SidebarLink href="/admin/conversations" icon={<MessageSquare size={20} />} label="Conversations" />
          <SidebarLink href="/admin/knowledge" icon={<Database size={20} />} label="Knowledge Base" />
          <SidebarLink href="/admin/orders" icon={<ShoppingCart size={20} />} label="Orders" />
        </nav>

        <div className="pt-8 border-t border-white/10 space-y-2">
          <SidebarLink href="/admin/settings" icon={<Settings size={20} />} label="Settings" />
          <button className="flex items-center space-x-3 w-full p-3 rounded-xl transition-colors hover:bg-white/5 text-red-400">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-[#0e0918] to-[#1a112a]">
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-10">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">Asitha Lakmal</p>
              <p className="text-xs text-white/50">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
          </div>
        </header>

        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center space-x-3 p-3 rounded-xl transition-all hover:bg-white/5 hover:translate-x-1 text-white/70 hover:text-white"
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}
