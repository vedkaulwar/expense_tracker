"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Target, MessageSquare, Repeat, LogOut } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out?")) return;
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const menuItems = [
    { icon: <LayoutDashboard size={22} />, label: "Home", href: "/" },
    { icon: <Target size={22} />, label: "Goals", href: "/goals" },
    { icon: <Repeat size={22} />, label: "Subs", href: "/subscriptions" },
    { icon: <MessageSquare size={22} />, label: "Chat", href: "/chat" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 z-50 px-4 py-3 safe-area-pb">
      <nav className="flex justify-between items-center max-w-md mx-auto">
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                isActive ? "text-emerald-500" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex flex-col items-center gap-1 p-2 text-zinc-500 hover:text-red-400 disabled:opacity-50 transition-colors"
        >
          <LogOut size={22} />
          <span className="text-[10px] font-medium">{loggingOut ? "..." : "Exit"}</span>
        </button>
      </nav>
    </div>
  );
}
