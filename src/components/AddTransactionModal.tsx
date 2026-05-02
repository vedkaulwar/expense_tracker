"use client";

import { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddTransactionModal({ 
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
    amount: "",
    merchant: "",
    category: "Food 🍔",
    type: "expense",
    paymentMethod: "UPI",
    notes: "",
  });
  const [isDelayed, setIsDelayed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount.toString(),
        merchant: initialData.merchant,
        category: initialData.category,
        type: initialData.type,
        paymentMethod: initialData.paymentMethod,
        notes: initialData.notes || "",
      });
      setIsDelayed(initialData.status === "pending_24h_delay");
    } else {
      setFormData({
        amount: "", merchant: "", category: "Food 🍔", type: "expense", paymentMethod: "UPI", notes: ""
      });
      setIsDelayed(false);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        merchant: formData.merchant || (formData.type === "income" ? "Income Source" : "Unknown Merchant"),
        amount: parseFloat(formData.amount),
        source: initialData ? initialData.source : "manual",
        status: isDelayed ? "pending_24h_delay" : "completed"
      };

      // Only add date if it's a new transaction (so we don't overwrite the original date)
      if (!initialData) {
        (payload as any).date = new Date().toISOString();
      }

      const url = initialData 
        ? `/api/transactions/${initialData._id}` 
        : "/api/transactions";
        
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error (${res.status}). Are you logged in?`);
      }

      onAdded();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save transaction.");
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
              <h2 className="text-xl font-bold">{initialData ? "Edit Transaction" : "Add Transaction"}</h2>
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
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-zinc-400 mb-1">Type</label>
                  <select 
                    className="w-full bg-zinc-800 border-none rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income (Credited)</option>
                  </select>
                </div>
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
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Merchant / Title (Optional)</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-800 border-none rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500"
                  placeholder={formData.type === "income" ? "e.g. Salary, Friend" : "e.g. Swiggy, Amazon"}
                  value={formData.merchant}
                  onChange={(e) => setFormData({...formData, merchant: e.target.value})}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-zinc-400 mb-1">Category</label>
                  <select 
                    className="w-full bg-zinc-800 border-none rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Food 🍔</option>
                    <option>Home/Grocery 🛒</option>
                    <option>Travel 🚗</option>
                    <option>Shopping 🛍️</option>
                    <option>Bills 💡</option>
                    <option>Others</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-zinc-400 mb-1">Method</label>
                  <select 
                    className="w-full bg-zinc-800 border-none rounded-xl p-3 text-white focus:ring-1 focus:ring-emerald-500"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  >
                    <option>UPI</option>
                    <option>Card</option>
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                  </select>
                </div>
              </div>

              {formData.type === "expense" && (
                <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                  <div className="mt-0.5 text-orange-400">
                    <Clock size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-orange-400">Impulse Control</h4>
                      <input 
                        type="checkbox" 
                        id="delayToggle"
                        checked={isDelayed}
                        onChange={(e) => setIsDelayed(e.target.checked)}
                        className="accent-orange-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-orange-400/80 mt-1">
                      Delay this expense by 24 hours to avoid impulse buying.
                    </p>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg py-3 rounded-xl mt-4 transition-colors"
              >
                {loading ? "Saving..." : isDelayed ? "Queue for 24h" : initialData ? "Update Transaction" : "Save Transaction"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
