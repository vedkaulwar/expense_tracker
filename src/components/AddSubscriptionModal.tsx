"use client";

import { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddSubscriptionModal({ 
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
    amount: "",
    category: "Entertainment",
    billingCycle: "monthly",
    nextBillingDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        amount: initialData.amount.toString(),
        category: initialData.category,
        billingCycle: initialData.billingCycle,
        nextBillingDate: new Date(initialData.nextBillingDate).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        name: "", 
        amount: "", 
        category: "Entertainment", 
        billingCycle: "monthly", 
        nextBillingDate: new Date().toISOString().split('T')[0],
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
        amount: parseFloat(formData.amount),
        nextBillingDate: new Date(formData.nextBillingDate).toISOString(),
      };

      const url = initialData 
        ? `/api/subscriptions/${initialData._id}` 
        : "/api/subscriptions";
        
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
      setError(err.message || "Failed to save subscription.");
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
              <h2 className="text-xl font-bold">{initialData ? "Edit Subscription" : "Add Subscription"}</h2>
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
                <label className="block text-xs text-zinc-400 mb-1">Service Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-zinc-800 border-none rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. Netflix, Spotify"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-zinc-400 mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-zinc-800 border-none rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-zinc-400 mb-1">Billing Cycle</label>
                  <select 
                    className="w-full bg-zinc-800 border-none rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500"
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Category</label>
                <select 
                  className="w-full bg-zinc-800 border-none rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option>Entertainment</option>
                  <option>Health</option>
                  <option>Utilities</option>
                  <option>Software</option>
                  <option>Others</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Next Payment Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    required
                    className="w-full bg-zinc-800 border-none rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500"
                    value={formData.nextBillingDate}
                    onChange={(e) => setFormData({...formData, nextBillingDate: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg py-3 rounded-xl mt-4 transition-colors"
              >
                {loading ? "Saving..." : initialData ? "Update Subscription" : "Add Subscription"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
