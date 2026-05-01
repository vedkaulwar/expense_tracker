"use client";

import { useState } from "react";
import { MessageSquarePlus, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SmsSimulator({ onTransactionAdded }: { onTransactionAdded: () => void }) {
  const [smsText, setSmsText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleParse = async () => {
    if (!smsText) return;
    setStatus("loading");
    
    try {
      const res = await fetch("/api/sms-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smsText })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage("Parsed & saved successfully!");
        setSmsText("");
        onTransactionAdded();
        
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to parse");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Network error");
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 mb-6 relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <MessageSquarePlus className="text-emerald-500" size={20} />
        <h3 className="font-semibold text-white">Auto-Track Simulator</h3>
      </div>
      
      <p className="text-sm text-zinc-400 mb-4 relative z-10">
        Paste a bank SMS here to test the auto-expense parser.
      </p>

      <div className="relative z-10">
        <textarea
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          placeholder="e.g. Rs.500 debited via UPI to Swiggy on 12-10-2023"
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none h-24 transition-all"
        />
        
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs">
            <AnimatePresence mode="wait">
              {status === "success" && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-emerald-500">
                  <CheckCircle2 size={14} /> {message}
                </motion.div>
              )}
              {status === "error" && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-red-500">
                  <AlertCircle size={14} /> {message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            onClick={handleParse}
            disabled={!smsText || status === "loading"}
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm py-2 px-4 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <Send size={14} />
            )}
            Parse SMS
          </button>
        </div>
      </div>
    </div>
  );
}
