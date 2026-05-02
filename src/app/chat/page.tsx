"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Send, Bot, User } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your ExpenseAI assistant. Ask me anything about your spending habits, totals, or specific categories like Food or Travel!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Error getting response." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Network error occurred." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <Sidebar />
      <main className="flex-1 flex flex-col p-4 md:p-8 h-screen pb-24 md:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Chat with your Money 🤖</h1>
          <p className="text-zinc-400">Powered by Simulated AI</p>
        </div>

        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i} 
                className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-emerald-500 text-black" : "bg-zinc-800 text-emerald-500 border border-emerald-500/20"}`}>
                  {m.role === "user" ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`p-4 rounded-2xl max-w-[80%] ${m.role === "user" ? "bg-emerald-500 text-black rounded-tr-none" : "bg-zinc-800/50 border border-zinc-700/50 text-white rounded-tl-none"}`}>
                  {m.content}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Bot size={20} />
                </div>
                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 rounded-tl-none flex gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSend} className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex gap-3">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about your expenses..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black p-3 rounded-xl transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
