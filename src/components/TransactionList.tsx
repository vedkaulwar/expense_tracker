"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { Coffee, ShoppingBag, ShoppingCart, Car, Zap, HelpCircle, Clock, Pencil, Trash2 } from "lucide-react";

const getCategoryIcon = (category: string) => {
  if (!category) return <HelpCircle size={18} className="text-zinc-400" />;
  if (category.includes("Food")) return <Coffee size={18} className="text-orange-400" />;
  if (category.includes("Grocery") || category.includes("Home")) return <ShoppingCart size={18} className="text-green-400" />;
  if (category.includes("Shopping")) return <ShoppingBag size={18} className="text-pink-400" />;
  if (category.includes("Travel")) return <Car size={18} className="text-blue-400" />;
  if (category.includes("Bills")) return <Zap size={18} className="text-yellow-400" />;
  return <HelpCircle size={18} className="text-zinc-400" />;
};

const formatDate = (dateValue: any) => {
  try {
    if (!dateValue) return "N/A";
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

export default function TransactionList({ 
  transactions, 
  loading,
  onEdit,
  onDelete
}: { 
  transactions: any[], 
  loading: boolean,
  onEdit?: (tx: any) => void,
  onDelete?: (id: string) => void
}) {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4">Recent Transactions</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-10 h-10 bg-zinc-800 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Recent Transactions</h3>
        <button className="text-sm text-emerald-500 hover:text-emerald-400">View All</button>
      </div>

      <div className="space-y-1">
        {transactions.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            No transactions yet. Add one or simulate an SMS!
          </div>
        ) : (
          transactions.map((tx, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={tx._id || idx}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/30 transition-colors group relative"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  {getCategoryIcon(tx.category)}
                </div>
                <div>
                  <h4 className="font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors">
                    {tx.merchant}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                    <span>{formatDate(tx.date)}</span>
                    <span>•</span>
                    <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                      {tx.paymentMethod}
                    </span>
                    {tx.status === "pending_24h_delay" && (
                      <span className="flex items-center gap-1 text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">
                        <Clock size={10} /> Delayed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`font-semibold flex items-center gap-1 ${tx.type === "expense" ? "text-white" : "text-emerald-500"}`}>
                  {tx.type === "expense" ? "-" : "+"}₹{(tx.amount || 0).toLocaleString("en-IN")}
                </div>
                
                {/* Action Buttons (visible on hover on desktop, always on mobile) */}
                <div className="md:opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity ml-2">
                  <button 
                    onClick={() => onEdit?.(tx)}
                    className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                    title="Edit transaction"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this transaction?")) {
                        onDelete?.(tx._id);
                      }
                    }}
                    className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete transaction"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
