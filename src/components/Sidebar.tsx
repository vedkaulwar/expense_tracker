"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Target, MessageSquare, Repeat, LogOut } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/" },
    { icon: <Target size={20} />, label: "Saving Goals", href: "/goals" },
    { icon: <Repeat size={20} />, label: "Subscriptions", href: "/subscriptions" },
    { icon: <MessageSquare size={20} />, label: "AI Chat", href: "/chat" },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 h-screen hidden md:flex flex-col border-r border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-bold">
          E
        </div>
        <h1 className="text-xl font-bold tracking-tight">ExpenseAI</h1>
      </div>

      <nav className="flex-1 space-y-1">
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

      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
      >
        <LogOut size={20} />
        <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
      </button>
    </aside>
  );
}
