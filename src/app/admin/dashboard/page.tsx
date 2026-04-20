import React from "react";
import { 
  Users, 
  MessageSquare, 
  ShoppingCart, 
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Conversations" 
          value="1,284" 
          change="+12.5%" 
          icon={<MessageSquare className="text-purple-400" />} 
        />
        <StatCard 
          title="Active Customers" 
          value="842" 
          change="+8.2%" 
          icon={<Users className="text-blue-400" />} 
        />
        <StatCard 
          title="Total Orders" 
          value="156" 
          change="+24.1%" 
          icon={<ShoppingCart className="text-emerald-400" />} 
        />
        <StatCard 
          title="Automation Success" 
          value="98.2%" 
          change="+1.4%" 
          icon={<CheckCircle2 className="text-amber-400" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Conversations */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Conversations</h2>
            <button className="text-sm text-purple-400 hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            <ConversationItem 
              user="+94 77 123 4567" 
              lastMessage="Where is my order #4521?" 
              time="2m ago" 
              intent="order_status" 
            />
            <ConversationItem 
              user="+94 76 987 6543" 
              lastMessage="Do you have Nike Air Max in red?" 
              time="15m ago" 
              intent="product_search" 
            />
            <ConversationItem 
              user="+94 71 555 0192" 
              lastMessage="Track my shipping please" 
              time="1h ago" 
              intent="courier_track" 
            />
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <h2 className="text-lg font-semibold">System Status</h2>
          <div className="space-y-6">
            <StatusItem label="Meta WhatsApp API" status="online" />
            <StatusItem label="WooCommerce REST" status="online" />
            <StatusItem label="DHL Tracking Service" status="online" />
            <StatusItem label="Groq AI Engine" status="online" />
            <StatusItem label="Supabase DB" status="online" />
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-sm text-white/50">
              <span>RAG Knowledge Base</span>
              <span>4,281 entries</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon }: { title: string; value: string; change: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/5 rounded-2xl">{icon}</div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg flex items-center">
          <TrendingUp size={12} className="mr-1" /> {change}
        </span>
      </div>
      <p className="text-sm text-white/50 font-medium">{title}</p>
      <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
    </div>
  );
}

function ConversationItem({ user, lastMessage, time, intent }: { user: string; lastMessage: string; time: string; intent: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/10">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center font-bold text-sm">
          {user.slice(-2)}
        </div>
        <div>
          <p className="font-semibold text-sm">{user}</p>
          <p className="text-xs text-white/40 line-clamp-1">{lastMessage}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] uppercase font-bold tracking-widest text-purple-400 mb-1">{intent}</div>
        <div className="flex items-center text-[10px] text-white/30 font-medium">
          <Clock size={10} className="mr-1" /> {time}
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: "online" | "offline" | "busy" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/70 font-medium">{label}</span>
      <div className="flex items-center space-x-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
          {status}
        </span>
        <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-red-400'}`} />
      </div>
    </div>
  );
}
