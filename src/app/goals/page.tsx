"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Plus, Target, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      if (Array.isArray(data)) setGoals(data);
      else if (data.goals) setGoals(data.goals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const dummyGoals = [
    { _id: "1", name: "New iPhone 15", targetAmount: 80000, currentAmount: 45000, icon: "📱" },
    { _id: "2", name: "Goa Trip", targetAmount: 25000, currentAmount: 5000, icon: "🏖️" },
  ];

  const displayGoals = goals.length > 0 ? goals : dummyGoals;

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Saving Jars 🎯</h1>
            <p className="text-zinc-400">Track your financial goals.</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-colors">
            <Plus size={20} /> New Goal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayGoals.map((g: any, idx) => {
            const percent = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                key={g._id} 
                className="glass-card rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="text-4xl mb-4">{g.icon}</div>
                <h3 className="text-xl font-bold mb-1">{g.name}</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  ₹{g.currentAmount.toLocaleString("en-IN")} saved of ₹{g.targetAmount.toLocaleString("en-IN")}
                </p>

                <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden mb-2 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-emerald-500 h-full rounded-full"
                  ></motion.div>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 font-medium">
                  <span>{percent.toFixed(1)}%</span>
                  {percent >= 100 && <span className="text-emerald-500 flex items-center gap-1"><Trophy size={12}/> Completed!</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
