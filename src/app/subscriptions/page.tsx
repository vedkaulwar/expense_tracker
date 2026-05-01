"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Plus, Repeat, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = async () => {
    try {
      const res = await fetch("/api/subscriptions");
      const data = await res.json();
      if (Array.isArray(data)) setSubs(data);
      else if (data.subscriptions) setSubs(data.subscriptions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const dummySubs = [
    { _id: "1", name: "Netflix Premium", amount: 649, category: "Entertainment", billingCycle: "monthly", nextBillingDate: new Date(Date.now() + 86400000 * 3) },
    { _id: "2", name: "Gym Membership", amount: 1500, category: "Health", billingCycle: "monthly", nextBillingDate: new Date(Date.now() + 86400000 * 12) },
    { _id: "3", name: "Spotify", amount: 119, category: "Entertainment", billingCycle: "monthly", nextBillingDate: new Date(Date.now() + 86400000 * 20) },
  ];

  const displaySubs = subs.length > 0 ? subs : dummySubs;
  const totalMonthlyBurn = displaySubs.filter((s:any) => s.billingCycle === "monthly").reduce((sum, s:any) => sum + s.amount, 0);

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Subscriptions 🔁</h1>
            <p className="text-zinc-400">Track your recurring payments.</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-colors">
            <Plus size={20} /> Add Sub
          </button>
        </div>

        <div className="mb-8 p-6 glass-card rounded-2xl flex items-center justify-between border border-red-500/20 bg-gradient-to-r from-red-500/5 to-transparent">
          <div>
            <p className="text-sm text-red-400 font-medium mb-1">Fixed Monthly Burn Rate</p>
            <h2 className="text-3xl font-bold text-white">₹{totalMonthlyBurn.toLocaleString("en-IN")}</h2>
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
              {displaySubs.map((sub: any, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={sub._id} 
                  className="hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                      <Repeat size={14} className="text-emerald-500" />
                    </div>
                    {sub.name}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell capitalize">{sub.billingCycle}</td>
                  <td className="px-6 py-4 text-zinc-300">
                    {format(new Date(sub.nextBillingDate), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-white">
                    ₹{sub.amount.toLocaleString("en-IN")}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
