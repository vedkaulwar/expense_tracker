"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, PieChart, Target, Zap, Settings, MessageSquare, Repeat } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/" },
    { icon: <Target size={20} />, label: "Saving Goals", href: "/goals" },
    { icon: <Repeat size={20} />, label: "Subscriptions", href: "/subscriptions" },
    { icon: <MessageSquare size={20} />, label: "AI Chat", href: "/chat" },
  ];

  return (
    <aside className="w-64 h-screen hidden md:flex flex-col border-r border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
          E
        </div>
        <h1 className="text-xl font-bold tracking-tight">ExpenseAI</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={idx}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-500 font-medium"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto glass-card rounded-2xl">
        <p className="text-xs text-zinc-400 mb-2">PRO Streak</p>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-white">12</span>
          <span className="text-sm text-zinc-500 mb-1">days on budget</span>
        </div>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-emerald-500 h-full w-3/4 rounded-full"></div>
        </div>
      </div>
    </aside>
  );
}
