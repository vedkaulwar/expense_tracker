"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AddGoalModal from "@/components/AddGoalModal";
import { Plus, Target, Trophy, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/goals");
      const data = await res.json();
      
      let goalsList = [];
      if (Array.isArray(data)) goalsList = data;
      else if (data && Array.isArray(data.goals)) goalsList = data.goals;
      
      setGoals(goalsList);
    } catch (e) {
      console.error("Fetch goals error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setGoals((prev) => prev.filter(g => g._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete goal.");
    }
  };

  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Saving Jars 🎯</h1>
            <p className="text-zinc-400">Track your financial goals.</p>
          </div>
          <button 
            onClick={() => {
              setEditingGoal(null);
              setIsModalOpen(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Plus size={20} /> <span className="hidden sm:inline">New Goal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-10 text-center text-zinc-500">Loading goals...</div>
          ) : goals.length === 0 ? (
            <div className="col-span-full py-10 text-center text-zinc-500">No goals found. Create one to get started!</div>
          ) : (
            goals.map((g: any, idx) => {
              const target = g.targetAmount || 1; // Avoid division by zero
              const percent = Math.min(((g.currentAmount || 0) / target) * 100, 100);
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  key={g._id} 
                  className="glass-card rounded-2xl p-6 relative overflow-hidden group"
                >
                  <div className="absolute top-4 right-4 md:opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <button 
                      onClick={() => handleEditGoal(g)}
                      className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteGoal(g._id)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="text-4xl mb-4">{g.icon}</div>
                  <h3 className="text-xl font-bold mb-1">{g.name || "Unnamed Goal"}</h3>
                  <p className="text-zinc-400 text-sm mb-4">
                    ₹{(g.currentAmount || 0).toLocaleString("en-IN")} saved of ₹{(g.targetAmount || 0).toLocaleString("en-IN")}
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
            })
          )}
        </div>
      </main>
      <MobileNav />

      <AddGoalModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        onAdded={fetchGoals}
        initialData={editingGoal}
      />
    </div>
  );
}
