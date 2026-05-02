"use client";

import { useState, useEffect } from "react";
import { X, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ICONS = ["📱", "🏖️", "🚗", "🏠", "💻", "🎓", "🚲", "💍", "🎁", "💰"];

export default function AddGoalModal({ 
  isOpen, 
  onClose, 
  onAdded,
  initialData 
}: { 
  isOpen: boolean, 
  onClose: () => void,
  onAdded: () => void,
  initialData?: any
}) {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "0",
    icon: "💰",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        targetAmount: initialData.targetAmount.toString(),
        currentAmount: initialData.currentAmount.toString(),
        icon: initialData.icon || "💰",
      });
    } else {
      setFormData({
        name: "", 
        targetAmount: "", 
        currentAmount: "0", 
        icon: "💰",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
      };

      const url = initialData 
        ? `/api/goals/${initialData._id}` 
        : "/api/goals";
        
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error (${res.status})`);
      }

      onAdded();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save goal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 z-50 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{initialData ? "Edit Goal" : "New Goal"}</h2>
              <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Goal Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-zinc-800 border-none rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. New iPhone, Vacation"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-zinc-400 mb-1">Target Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-zinc-800 border-none rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500"
                    placeholder="0.00"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-zinc-400 mb-1">Current Saved (₹)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-zinc-800 border-none rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500"
                    placeholder="0.00"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({...formData, currentAmount: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Choose Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({...formData, icon})}
                      className={`text-2xl p-2 rounded-xl transition-colors ${formData.icon === icon ? "bg-emerald-500/20 border border-emerald-500" : "bg-zinc-800 hover:bg-zinc-700 border border-transparent"}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg py-3 rounded-xl mt-4 transition-colors"
              >
                {loading ? "Saving..." : initialData ? "Update Goal" : "Create Goal"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
