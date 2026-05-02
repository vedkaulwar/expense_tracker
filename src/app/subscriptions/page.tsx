"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AddSubscriptionModal from "@/components/AddSubscriptionModal";
import { Plus, Repeat, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<any>(null);

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/subscriptions");
      const data = await res.json();
      
      // Ensure data is an array
      let subsList = [];
      if (Array.isArray(data)) subsList = data;
      else if (data && Array.isArray(data.subscriptions)) subsList = data.subscriptions;
      
      setSubs(subsList);
    } catch (e) {
      console.error("Fetch subs error:", e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue: any) => {
    try {
      if (!dateValue) return "N/A";
      
      // Handle Firestore Timestamp { _seconds, _nanoseconds }
      if (dateValue && typeof dateValue === 'object' && '_seconds' in dateValue) {
        return format(new Date(dateValue._seconds * 1000), "MMM dd, yyyy");
      }
      
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      return format(date, "MMM dd, yyyy");
    } catch (err) {
      return "Error";
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleDeleteSub = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription?")) return;
    try {
      const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setSubs((prev) => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete subscription.");
    }
  };

  const handleEditSub = (sub: any) => {
    setEditingSub(sub);
    setIsModalOpen(true);
  };

  const totalMonthlyBurn = subs.reduce((sum, s:any) => {
    if (s.billingCycle === "monthly") return sum + s.amount;
    if (s.billingCycle === "yearly") return sum + (s.amount / 12);
    if (s.billingCycle === "weekly") return sum + (s.amount * 4);
    return sum;
  }, 0);

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Subscriptions 🔁</h1>
            <p className="text-zinc-400">Track your recurring payments.</p>
          </div>
          <button 
            onClick={() => {
              setEditingSub(null);
              setIsModalOpen(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Plus size={20} /> <span className="hidden sm:inline">Add Sub</span>
          </button>
        </div>

        <div className="mb-8 p-6 glass-card rounded-2xl flex items-center justify-between border border-red-500/20 bg-gradient-to-r from-red-500/5 to-transparent">
          <div>
            <p className="text-sm text-red-400 font-medium mb-1">Estimated Monthly Burn Rate</p>
            <h2 className="text-3xl font-bold text-white">₹{Math.round(totalMonthlyBurn).toLocaleString("en-IN")}</h2>
          </div>
          <div className="hidden md:flex text-red-400/80 bg-red-400/10 p-3 rounded-full">
            <AlertTriangle size={30} />
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-800/50 text-zinc-400 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4 hidden md:table-cell">Billing Cycle</th>
                <th className="px-6 py-4">Next Payment</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-zinc-500">Loading subscriptions...</td>
                </tr>
              ) : subs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-zinc-500">No subscriptions found.</td>
                </tr>
              ) : (
                subs.map((sub: any, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={sub._id} 
                    className="hover:bg-zinc-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                        <Repeat size={14} className="text-emerald-500" />
                      </div>
                      {sub.name}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell capitalize">{sub.billingCycle}</td>
                    <td className="px-6 py-4 text-zinc-300">
                      {formatDate(sub.nextBillingDate)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-white">
                      <div className="flex items-center justify-end gap-3">
                        <span>₹{(sub.amount || 0).toLocaleString("en-IN")}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button 
                            onClick={() => handleEditSub(sub)}
                            className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteSub(sub._id)}
                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
      <MobileNav />

      <AddSubscriptionModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSub(null);
        }}
        onAdded={fetchSubs}
        initialData={editingSub}
      />
    </div>
  );
}
