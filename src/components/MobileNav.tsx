"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, MessageSquare, Repeat } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const menuItems = [
    { icon: <LayoutDashboard size={24} />, label: "Home", href: "/" },
    { icon: <Target size={24} />, label: "Goals", href: "/goals" },
    { icon: <Repeat size={24} />, label: "Subs", href: "/subscriptions" },
    { icon: <MessageSquare size={24} />, label: "Chat", href: "/chat" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50 px-6 py-3 safe-area-pb">
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
      </nav>
    </div>
  );
}
