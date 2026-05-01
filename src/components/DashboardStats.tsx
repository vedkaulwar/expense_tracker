"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Wallet, CreditCard, TrendingUp } from "lucide-react";

export default function DashboardStats({ transactions }: { transactions: any[] }) {
  const currentMonthExpenses = transactions
    .filter(t => t.type === "expense" && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((acc, curr) => acc + curr.amount, 0);

  const previousMonthExpenses = transactions
    .filter(t => t.type === "expense" && new Date(t.date).getMonth() === new Date().getMonth() - 1)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Avoid division by zero
  const percentChange = previousMonthExpenses === 0 
    ? 0 
    : ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;

  const isUp = percentChange > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet size={80} />
        </div>
        <p className="text-sm text-zinc-400 font-medium mb-1">Total Balance</p>
        <h2 className="text-3xl font-bold tracking-tight mb-2">₹1,24,500</h2>
        <div className="flex items-center text-xs text-emerald-500 bg-emerald-500/10 w-fit px-2 py-1 rounded-full">
          <ArrowUpRight size={14} className="mr-1" />
          <span>+2.4% vs last month</span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <CreditCard size={80} />
        </div>
        <p className="text-sm text-zinc-400 font-medium mb-1">Monthly Spends</p>
        <h2 className="text-3xl font-bold tracking-tight mb-2">₹{currentMonthExpenses.toLocaleString("en-IN")}</h2>
        <div className={`flex items-center text-xs w-fit px-2 py-1 rounded-full ${isUp ? "text-red-500 bg-red-500/10" : "text-emerald-500 bg-emerald-500/10"}`}>
          {isUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
          <span>{Math.abs(percentChange).toFixed(1)}% vs last month</span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-transparent"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500">
          <TrendingUp size={80} />
        </div>
        <p className="text-sm text-emerald-400/80 font-medium mb-1">AI Insight</p>
        <h3 className="text-lg font-semibold leading-tight mt-2 text-white/90">
          "You spend 40% more on food during weekends. Consider meal prepping."
        </h3>
      </motion.div>
    </div>
  );
}
