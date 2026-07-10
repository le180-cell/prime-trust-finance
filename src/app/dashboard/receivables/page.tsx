"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Receipt, Clock, AlertTriangle, CheckCircle, DollarSign,
  Search, LoaderCircle,
} from "lucide-react"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

interface Receivable { id: number; type: string; amount: number; dueDate: string; status: string; description: string | null; reference: string | null }

const typeColors: Record<string, string> = { Loan: "bg-blue-50 text-blue-700 border-blue-200", Savings: "bg-green-50 text-green-700 border-green-200", Penalty: "bg-red-50 text-red-700 border-red-200", Interest: "bg-purple-50 text-purple-700 border-purple-200", Registration: "bg-amber-50 text-amber-700 border-amber-200", payment: "bg-indigo-50 text-indigo-700 border-indigo-200" }
const statusColors: Record<string, string> = { paid: "bg-green-50 text-green-700 border-green-200", overdue: "bg-red-50 text-red-700 border-red-200", pending: "bg-amber-50 text-amber-700 border-amber-200", due_today: "bg-blue-50 text-blue-700 border-blue-200" }
const statusLabels: Record<string, string> = { paid: "Paid", overdue: "Overdue", pending: "Pending", due_today: "Due Today" }

function Skeleton({ className = "" }: { className?: string }) { return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} /> }

export default function ReceivablesPage() {
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [payingId, setPayingId] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/dashboard/receivables")
      .then((r) => r.json())
      .then((data) => setReceivables(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()
  const weekFromNow = new Date(today); weekFromNow.setDate(weekFromNow.getDate() + 7)

  const stats = useMemo(() => {
    const total = receivables.reduce((s, r) => s + r.amount, 0)
    const dueToday = receivables.filter((r) => r.dueDate === today.toISOString().split("T")[0] && r.status !== "paid").reduce((s, r) => s + r.amount, 0)
    const overdue = receivables.filter((r) => new Date(r.dueDate) < today && r.status !== "paid").reduce((s, r) => s + r.amount, 0)
    const collectedToday = receivables.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0)
    return { total, dueToday, overdue, collectedToday }
  }, [receivables])

  const types = ["All", ...Array.from(new Set(receivables.map((r) => r.type)))]
  const statuses = ["All", "Due Today", "Overdue", "Paid", "Pending"]

  const filtered = receivables.filter((r) => {
    if (typeFilter !== "All" && r.type !== typeFilter) return false
    if (statusFilter !== "All") {
      const map: Record<string, string> = { "Due Today": "due_today", Overdue: "overdue", Paid: "paid", Pending: "pending" }
      if (r.status !== map[statusFilter]) return false
    }
    const desc = (r.description || r.type || "").toLowerCase()
    const ref = (r.reference || "").toLowerCase()
    if (search && !desc.includes(search.toLowerCase()) && !ref.includes(search.toLowerCase())) return false
    return true
  })

  async function handlePay(id: number) {
    setPayingId(id)
    try {
      const res = await fetch("/api/payments/initiate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: receivables.find(r => r.id === id)?.amount || 0, sourceType: "mobile_money", destinationType: "receivable", destinationId: id, reference: `REC-${id}` }) })
      if (res.ok) setReceivables((prev) => prev.map((r) => r.id === id ? { ...r, status: "paid" } : r))
    } catch {}
    finally { setPayingId(null) }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-36 rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0E4F75] to-[#06263C] p-6 text-white shadow-[0_24px_60px_rgba(11,60,93,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.14),transparent_26%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10"><Receipt className="h-6 w-6 text-accent" /></div>
              <div>
                <h1 className="font-heading text-2xl font-bold sm:text-3xl">My Receivables</h1>
                <p className="text-sm text-white/65">Outstanding: <span className="font-semibold text-accent">{formatCurrency(stats.total)}</span></p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Outstanding", value: stats.total, icon: Receipt, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Due Today", value: stats.dueToday, icon: Clock, color: "text-red-600", bg: "bg-red-50" },
            { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
            { label: "Collected Today", value: stats.collectedToday, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          ].map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", card.bg)}><Icon className={cn("h-5 w-5", card.color)} /></div>
                </div>
                <p className="text-xs text-slate-500 mb-1">{card.label}</p>
                <span className="text-2xl font-bold text-gray-800">{formatCurrency(card.value)}</span>
              </div>
            )
          })}
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 pl-10 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
          </div>
          <div className="flex items-center gap-2">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-xs font-medium text-slate-600 outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10">
              {types.map((o) => <option key={o} value={o}>{o === "All" ? "All Types" : o}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-xs font-medium text-slate-600 outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10">
              {statuses.map((o) => <option key={o} value={o}>{o === "All" ? "All Statuses" : o}</option>)}
            </select>
          </div>
        </motion.div>

        {filtered.length === 0 ? (
          <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white flex flex-col items-center justify-center py-16">
            <CheckCircle className="h-14 w-14 text-green-300" />
            <p className="mt-4 text-lg font-medium text-slate-500">All cleared</p>
            <p className="mt-1 text-sm text-slate-400">No outstanding receivables.</p>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3.5 text-left font-medium text-slate-500">Description</th>
                    <th className="px-4 py-3.5 text-left font-medium text-slate-500">Reference</th>
                    <th className="px-4 py-3.5 text-left font-medium text-slate-500">Type</th>
                    <th className="px-4 py-3.5 text-left font-medium text-slate-500">Amount</th>
                    <th className="px-4 py-3.5 text-left font-medium text-slate-500">Due Date</th>
                    <th className="px-4 py-3.5 text-left font-medium text-slate-500">Status</th>
                    <th className="px-4 py-3.5 text-right font-medium text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((r, i) => {
                      const daysOverdue = Math.max(0, Math.floor((today.getTime() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
                      return (
                        <motion.tr key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ delay: i * 0.03 }}
                          className="border-b border-slate-50 transition-all hover:bg-slate-50/50">
                          <td className="px-4 py-3.5"><span className="font-medium text-slate-800">{r.description || r.type}</span></td>
                          <td className="px-4 py-3.5"><span className="text-xs font-mono text-slate-500">{r.reference || `REF-${r.id}`}</span></td>
                          <td className="px-4 py-3.5"><span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium", typeColors[r.type] || "bg-gray-50 text-gray-700 border-gray-200")}>{r.type}</span></td>
                          <td className="px-4 py-3.5"><span className="font-medium text-slate-800">{formatCurrency(r.amount)}</span></td>
                          <td className="px-4 py-3.5">
                            <span className="text-slate-500">{formatDate(r.dueDate)}</span>
                            {daysOverdue > 0 && r.status !== "paid" && <span className="ml-1.5 text-xs font-medium text-red-500">({daysOverdue}d)</span>}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium", statusColors[r.status] || "bg-gray-50 text-gray-700 border-gray-200")}>{statusLabels[r.status] || r.status}</span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {r.status !== "paid" ? (
                              <button onClick={() => handlePay(r.id)} disabled={payingId === r.id}
                                className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 border border-green-200 transition-all hover:bg-green-100 disabled:opacity-50">
                                {payingId === r.id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />} Pay Now
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">Paid</span>
                            )}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
