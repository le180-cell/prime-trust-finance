"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Receipt, Clock, Calendar, AlertTriangle, CheckCircle, DollarSign,
  Search, ChevronDown, ChevronUp,
} from "lucide-react"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

interface Receivable {
  id: number
  memberName: string
  memberInitials: string
  reference: string
  type: "Loan" | "Savings" | "Penalty" | "Interest" | "Registration"
  amountDue: number
  dueDate: string
  status: "paid" | "overdue" | "pending" | "due_today"
}

const mockReceivables: Receivable[] = [
  { id: 1, memberName: "Development Loan Installment", memberInitials: "DL", reference: "INV-2026-001", type: "Loan", amountDue: 285000, dueDate: "2026-07-01", status: "due_today" },
  { id: 2, memberName: "Monthly Savings Contribution", memberInitials: "SC", reference: "INV-2026-002", type: "Savings", amountDue: 50000, dueDate: "2026-06-28", status: "overdue" },
  { id: 3, memberName: "Interest Payment", memberInitials: "IP", reference: "INV-2026-003", type: "Interest", amountDue: 120000, dueDate: "2026-07-05", status: "pending" },
  { id: 4, memberName: "Penalty Fee", memberInitials: "PF", reference: "INV-2026-004", type: "Penalty", amountDue: 15000, dueDate: "2026-06-25", status: "overdue" },
  { id: 5, memberName: "Registration Fee", memberInitials: "RF", reference: "INV-2026-005", type: "Registration", amountDue: 30000, dueDate: "2026-07-10", status: "pending" },
  { id: 6, memberName: "Loan Installment", memberInitials: "LI", reference: "INV-2026-006", type: "Loan", amountDue: 450000, dueDate: "2026-07-03", status: "pending" },
  { id: 7, memberName: "Savings Contribution", memberInitials: "SC", reference: "INV-2026-007", type: "Savings", amountDue: 50000, dueDate: "2026-06-20", status: "paid" },
]

const typeColors: Record<string, string> = {
  Loan: "bg-blue-50 text-blue-700 border-blue-200",
  Savings: "bg-green-50 text-green-700 border-green-200",
  Penalty: "bg-red-50 text-red-700 border-red-200",
  Interest: "bg-purple-50 text-purple-700 border-purple-200",
  Registration: "bg-amber-50 text-amber-700 border-amber-200",
}

const statusColors: Record<string, string> = {
  paid: "bg-green-50 text-green-700 border-green-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  due_today: "bg-blue-50 text-blue-700 border-blue-200",
}

const statusLabels: Record<string, string> = { paid: "Paid", overdue: "Overdue", pending: "Pending", due_today: "Due Today" }

function AnimatedCounter({ value }: { value: number }) {
  return <span className="text-2xl font-bold text-gray-800">{formatCurrency(value)}</span>
}

export default function ReceivablesPage() {
  const [receivables, setReceivables] = useState<Receivable[]>(mockReceivables)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  const weekFromNow = new Date(today)
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  const weekStr = weekFromNow.toISOString().split("T")[0]

  const stats = {
    total: receivables.reduce((s, r) => s + r.amountDue, 0),
    dueToday: receivables.filter((r) => r.status === "due_today").reduce((s, r) => s + r.amountDue, 0),
    dueThisWeek: receivables.filter((r) => r.dueDate >= todayStr && r.dueDate <= weekStr && r.status !== "paid").reduce((s, r) => s + r.amountDue, 0),
    overdue: receivables.filter((r) => r.status === "overdue").reduce((s, r) => s + r.amountDue, 0),
    collectedToday: receivables.filter((r) => r.status === "paid").reduce((s, r) => s + r.amountDue, 0),
    outstanding: receivables.filter((r) => r.status !== "paid").reduce((s, r) => s + r.amountDue, 0),
  }

  const filtered = receivables.filter((r) => {
    if (typeFilter !== "All" && r.type !== typeFilter) return false
    if (statusFilter !== "All") {
      const map: Record<string, string> = { "Due Today": "due_today", Overdue: "overdue", Paid: "paid", Pending: "pending" }
      if (r.status !== map[statusFilter]) return false
    }
    if (search && !r.memberName.toLowerCase().includes(search.toLowerCase()) && !r.reference.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function calcDaysOverdue(dueDate: string) {
    const due = new Date(dueDate)
    return Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)))
  }

  function handleMarkPaid(r: Receivable) {
    setReceivables((prev) => prev.map((item) => item.id === r.id ? { ...item, status: "paid" } : item))
  }

  const summaryCards = [
    { label: "Total Outstanding", value: stats.total, icon: Receipt, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Due Today", value: stats.dueToday, icon: Clock, color: "text-red-600", bg: "bg-red-50" },
    { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Collected Today", value: stats.collectedToday, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0E4F75] to-[#06263C] p-6 text-white shadow-[0_24px_60px_rgba(11,60,93,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.14),transparent_26%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10">
                <Receipt className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold sm:text-3xl">My Receivables</h1>
                <p className="text-sm text-white/65">Outstanding: <span className="font-semibold text-accent">{formatCurrency(stats.total)}</span></p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", card.bg)}>
                    <Icon className={cn("h-5 w-5", card.color)} />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-1">{card.label}</p>
                <AnimatedCounter value={card.value} />
              </div>
            )
          })}
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or reference..."
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 pl-10 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
          </div>
          <div className="flex items-center gap-2">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-xs font-medium text-slate-600 outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10">
              {["All", "Loan", "Savings", "Penalty", "Interest", "Registration"].map((o) => <option key={o} value={o}>{o === "All" ? "All Types" : o}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-xs font-medium text-slate-600 outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10">
              {["All", "Due Today", "Overdue", "Paid", "Pending"].map((o) => <option key={o} value={o}>{o === "All" ? "All Statuses" : o}</option>)}
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
                    <th className="px-4 py-3.5 text-left font-medium text-slate-500">Amount Due</th>
                    <th className="px-4 py-3.5 text-left font-medium text-slate-500">Due Date</th>
                    <th className="px-4 py-3.5 text-left font-medium text-slate-500">Status</th>
                    <th className="px-4 py-3.5 text-right font-medium text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((r, i) => {
                      const daysOverdue = calcDaysOverdue(r.dueDate)
                      return (
                        <motion.tr key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ delay: i * 0.03 }}
                          className="border-b border-slate-50 transition-all hover:bg-slate-50/50">
                          <td className="px-4 py-3.5"><span className="font-medium text-slate-800">{r.memberName}</span></td>
                          <td className="px-4 py-3.5"><span className="text-xs font-mono text-slate-500">{r.reference}</span></td>
                          <td className="px-4 py-3.5"><span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium", typeColors[r.type])}>{r.type}</span></td>
                          <td className="px-4 py-3.5"><span className="font-medium text-slate-800">{formatCurrency(r.amountDue)}</span></td>
                          <td className="px-4 py-3.5">
                            <span className="text-slate-500">{formatDate(r.dueDate)}</span>
                            {daysOverdue > 0 && r.status !== "paid" && <span className="ml-1.5 text-xs font-medium text-red-500">({daysOverdue}d overdue)</span>}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium", statusColors[r.status])}>{statusLabels[r.status]}</span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {r.status !== "paid" ? (
                              <button onClick={() => handleMarkPaid(r)}
                                className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 border border-green-200 transition-all hover:bg-green-100">
                                <CheckCircle className="h-3.5 w-3.5" /> Pay Now
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
