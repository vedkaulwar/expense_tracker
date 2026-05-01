"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardStats from "@/components/DashboardStats";
import TransactionList from "@/components/TransactionList";
import SmsSimulator from "@/components/SmsSimulator";
import ExpenseChart from "@/components/ExpenseChart";
import AddTransactionModal from "@/components/AddTransactionModal";
import * as XLSX from "xlsx";
import { Plus, Download } from "lucide-react";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/transactions");
      const data = await res.json();
      if (Array.isArray(data)) {
        setTransactions(data);
      } else if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (transactions.length === 0) return alert("No data to export!");
    
    // Format data for Excel
    const exportData = transactions.map((t: any) => ({
      Date: new Date(t.date).toLocaleDateString("en-IN"),
      Merchant: t.merchant,
      Category: t.category,
      Amount: t.amount,
      Type: t.type.toUpperCase(),
      Method: t.paymentMethod,
      Notes: t.notes || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    
    // Create Excel file and trigger download
    XLSX.writeFile(workbook, `ExpenseAI_Report_${new Date().toLocaleDateString("en-IN")}.xlsx`);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Hello, Ved! 👋</h1>
              <p className="text-zinc-400 mt-1">Here's your financial overview.</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handleExport}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors border border-zinc-700"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export CA Report</span>
              </button>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add Expense</span>
              </button>
            </div>
          </div>

          <DashboardStats transactions={transactions} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SmsSimulator onTransactionAdded={fetchTransactions} />
              <TransactionList transactions={transactions} loading={loading} />
            </div>
            
            <div className="space-y-6">
              <ExpenseChart transactions={transactions} />
              
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-4">Impulse Queue</h3>
                {transactions.filter((t: any) => t.status === "pending_24h_delay").length === 0 ? (
                  <p className="text-zinc-500 text-sm">No delayed expenses. Great job!</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.filter((t: any) => t.status === "pending_24h_delay").map((tx: any) => (
                      <div key={tx._id} className="p-3 bg-zinc-800/50 rounded-xl border border-orange-500/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{tx.merchant}</p>
                            <p className="text-xs text-orange-400 mt-1">Unlocks in 23h 45m</p>
                          </div>
                          <span className="font-semibold">₹{tx.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdded={fetchTransactions} 
      />
    </div>
  );
}
