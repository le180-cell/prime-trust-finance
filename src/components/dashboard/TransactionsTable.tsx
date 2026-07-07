"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight, ArrowDownRight, Download, Search } from "lucide-react"

interface Transaction {
  id: number
  type: "credit" | "debit"
  amount: number
  description: string
  date: string
  status: string
  category: string
}

export default function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  const [search, setSearch] = useState("")

  const filtered = transactions.filter((t) =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900">Recent Transactions</h3>
          <p className="mt-0.5 text-sm text-slate-500">Your latest account activity</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-48 rounded-[14px] border border-slate-200 bg-white/80 py-2 pl-9 pr-3 text-sm outline-none transition-all focus:w-56 focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-slate-200 text-slate-400 transition hover:border-slate-300 hover:text-slate-600" aria-label="Download transactions">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              <th className="pb-3 pr-4">Type</th>
              <th className="pb-3 pr-4">Description</th>
              <th className="pb-3 pr-4">Category</th>
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((tx, i) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-50 transition-colors last:border-none hover:bg-slate-50/50"
                >
                  <td className="py-3.5 pr-4">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${
                      tx.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                    }`}>
                      {tx.type === "credit" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <p className="text-sm font-medium text-slate-800">{tx.description}</p>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="inline-block rounded-[8px] bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-slate-500">{tx.date}</td>
                  <td className={`py-3.5 text-right text-sm font-semibold ${
                    tx.type === "credit" ? "text-emerald-600" : "text-red-500"
                  }`}>
                    {tx.type === "credit" ? "+" : "-"}RWF {new Intl.NumberFormat("en-US").format(tx.amount)}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
