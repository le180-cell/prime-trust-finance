"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Receipt, Clock, Calendar, AlertTriangle, CheckCircle, DollarSign,
  Search, ChevronDown, ChevronUp,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

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
  { id: 1, memberName: "Jean-Pierre Habimana", memberInitials: "JH", reference: "INV-2026-001", type: "Loan", amountDue: 250000, dueDate: "2026-07-01", status: "due_today" },
  { id: 2, memberName: "Alice Mukamana", memberInitials: "AM", reference: "INV-2026-002", type: "Savings", amountDue: 50000, dueDate: "2026-06-28", status: "overdue" },
  { id: 3, memberName: "David Kagame", memberInitials: "DK", reference: "INV-2026-003", type: "Interest", amountDue: 120000, dueDate: "2026-07-05", status: "pending" },
  { id: 4, memberName: "Grace Uwimana", memberInitials: "GU", reference: "INV-2026-004", type: "Penalty", amountDue: 15000, dueDate: "2026-06-25", status: "overdue" },
  { id: 5, memberName: "Patrick Niyonzima", memberInitials: "PN", reference: "INV-2026-005", type: "Registration", amountDue: 30000, dueDate: "2026-07-10", status: "pending" },
  { id: 6, memberName: "Beatrice Imanishimwe", memberInitials: "BI", reference: "INV-2026-006", type: "Loan", amountDue: 450000, dueDate: "2026-07-03", status: "pending" },
  { id: 7, memberName: "Samuel Nkurunziza", memberInitials: "SN", reference: "INV-2026-007", type: "Loan", amountDue: 180000, dueDate: "2026-06-20", status: "paid" },
  { id: 8, memberName: "Chantal Uwase", memberInitials: "CU", reference: "INV-2026-008", type: "Savings", amountDue: 75000, dueDate: "2026-07-02", status: "due_today" },
  { id: 9, memberName: "Olivier Mugisha", memberInitials: "OM", reference: "INV-2026-009", type: "Interest", amountDue: 90000, dueDate: "2026-06-15", status: "paid" },
  { id: 10, memberName: "Diane Nyiraneza", memberInitials: "DN", reference: "INV-2026-010", type: "Penalty", amountDue: 25000, dueDate: "2026-07-08", status: "pending" },
  { id: 11, memberName: "Emmanuel Habiyaremye", memberInitials: "EH", reference: "INV-2026-011", type: "Registration", amountDue: 30000, dueDate: "2026-06-22", status: "overdue" },
  { id: 12, memberName: "Francoise Uwimana", memberInitials: "FU", reference: "INV-2026-012", type: "Loan", amountDue: 320000, dueDate: "2026-07-12", status: "pending" },
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

const statusLabels: Record<string, string> = {
  paid: "Paid",
  overdue: "Overdue",
  pending: "Pending",
  due_today: "Due Today",
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const display = formatCurrency(value)
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-2xl font-bold text-gray-800"
    >
      {display}{suffix}
    </motion.span>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

function SkeletonTable() {
  return (
    <div className="admin-card overflow-hidden p-5 space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="h-9 w-9 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-3 w-24 rounded bg-gray-100" />
          </div>
          <div className="h-4 w-20 rounded bg-gray-200" />
          <div className="h-4 w-28 rounded bg-gray-100" />
          <div className="h-4 w-24 rounded bg-gray-100" />
          <div className="h-4 w-16 rounded bg-gray-100" />
          <div className="h-8 w-20 rounded-lg bg-gray-100" />
        </div>
      ))}
    </div>
  )
}

export default function AdminReceivablesPage() {
  const [receivables, setReceivables] = useState<Receivable[]>(mockReceivables)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  useEffect(() => { setLoading(false) }, [])
  const [typeFilter, setTypeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  const weekFromNow = new Date(today)
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  const weekStr = weekFromNow.toISOString().split("T")[0]

  const stats = useMemo(() => {
    const total = receivables.reduce((s, r) => s + r.amountDue, 0)
    const dueToday = receivables.filter((r) => r.status === "due_today").reduce((s, r) => s + r.amountDue, 0)
    const dueThisWeek = receivables.filter((r) => r.dueDate >= todayStr && r.dueDate <= weekStr && r.status !== "paid").reduce((s, r) => s + r.amountDue, 0)
    const overdue = receivables.filter((r) => r.status === "overdue").reduce((s, r) => s + r.amountDue, 0)
    const collectedToday = receivables.filter((r) => r.status === "paid" && r.dueDate === todayStr).reduce((s, r) => s + r.amountDue, 0)
    const outstanding = receivables.filter((r) => r.status !== "paid").reduce((s, r) => s + r.amountDue, 0)
    return { total, dueToday, dueThisWeek, overdue, collectedToday, outstanding }
  }, [receivables, todayStr, weekStr])

  const filtered = useMemo(() => {
    let result = receivables
    if (typeFilter !== "All") result = result.filter((r) => r.type === typeFilter)
    if (statusFilter !== "All") {
      const map: Record<string, string> = { "Due Today": "due_today", Overdue: "overdue", Paid: "paid", Pending: "pending" }
      result = result.filter((r) => r.status === map[statusFilter])
    }
    if (search) result = result.filter((r) =>
      r.memberName.toLowerCase().includes(search.toLowerCase()) ||
      r.reference.toLowerCase().includes(search.toLowerCase())
    )
    return result
  }, [receivables, typeFilter, statusFilter, search])

  function calcDaysOverdue(dueDate: string) {
    const due = new Date(dueDate)
    const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  function handleMarkPaid(r: Receivable) {
    setReceivables((prev) => prev.map((item) => item.id === r.id ? { ...item, status: "paid" } : item))
    toast.success("Payment recorded — receivable marked as paid. Finance, reports, and member dashboard updated.")
  }

  function toggleExpand(id: number) {
    setExpandedId((prev) => prev === id ? null : id)
  }

  const summaryCards = [
    { label: "Total Receivables", value: stats.total, icon: Receipt, color: "text-amber-600", bg: "bg-amber-50", trend: "+12%", trendUp: true },
    { label: "Due Today", value: stats.dueToday, icon: Clock, color: "text-red-600", bg: "bg-red-50", trend: "8 items", trendUp: false },
    { label: "Due This Week", value: stats.dueThisWeek, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50", trend: "+5%", trendUp: true },
    { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", trend: "+3", trendUp: false },
    { label: "Collected Today", value: stats.collectedToday, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", trend: "+2", trendUp: true },
    { label: "Outstanding", value: stats.outstanding, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50", trend: "-8%", trendUp: false },
  ]

  const typeOptions = ["All", "Loan", "Savings", "Penalty", "Interest", "Registration"]
  const statusOptions = ["All", "Due Today", "Overdue", "Paid", "Pending"]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary sm:text-3xl flex items-center gap-3">
            Accounts Receivable
          </h1>
          <p className="mt-1 text-gray-500">
            Total outstanding: <span className="font-semibold text-primary">{formatCurrency(stats.total)}</span>
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="admin-stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", card.bg)}>
                  <Icon className={cn("h-5 w-5", card.color)} />
                </div>
                <span className={cn("text-xs font-medium", card.trendUp ? "text-green-600" : "text-red-500")}>
                  {card.trend}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <AnimatedCounter value={card.value} />
            </div>
          )
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or reference..."
            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 pl-10 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2.5 text-xs font-medium text-gray-600 outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10"
          >
            {typeOptions.map((o) => <option key={o} value={o}>{o === "All" ? "All Types" : o}</option>)}
          </select>
          <select
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2.5 text-xs font-medium text-gray-600 outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10"
          >
            {statusOptions.map((o) => <option key={o} value={o}>{o === "All" ? "All Statuses" : o}</option>)}
          </select>
          <input
            type="date"
            className="rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2.5 text-xs font-medium text-gray-600 outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10"
          />
        </div>
      </motion.div>

      {loading ? (
        <SkeletonTable />
      ) : filtered.length === 0 ? (
        <motion.div variants={itemVariants} className="admin-card flex flex-col items-center justify-center py-16">
          <CheckCircle className="h-14 w-14 text-green-300" />
          <p className="mt-4 text-lg font-medium text-gray-500">All receivables cleared</p>
          <p className="mt-1 text-sm text-gray-400">No outstanding receivables match your criteria.</p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3.5 text-left font-medium text-gray-500">Member</th>
                  <th className="px-4 py-3.5 text-left font-medium text-gray-500">Reference</th>
                  <th className="px-4 py-3.5 text-left font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3.5 text-left font-medium text-gray-500">Amount Due</th>
                  <th className="px-4 py-3.5 text-left font-medium text-gray-500">Due Date</th>
                  <th className="px-4 py-3.5 text-left font-medium text-gray-500">Days Overdue</th>
                  <th className="px-4 py-3.5 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3.5 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((r, i) => {
                    const daysOverdue = calcDaysOverdue(r.dueDate)
                    const isExpanded = expandedId === r.id
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 transition-all hover:bg-gray-50/50"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white text-sm font-bold shadow-sm">
                              {r.memberInitials}
                            </div>
                            <span className="font-medium text-gray-800">{r.memberName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-mono text-gray-500">{r.reference}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium", typeColors[r.type])}>
                            {r.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-gray-800">{formatCurrency(r.amountDue)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-gray-500">{formatDate(r.dueDate)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          {r.status !== "paid" && daysOverdue > 0 ? (
                            <span className="font-medium text-red-600">{daysOverdue}d</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium", statusColors[r.status])}>
                            {statusLabels[r.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {r.status !== "paid" && (
                              <button
                                onClick={() => handleMarkPaid(r)}
                                className="flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 border border-green-200 transition-all hover:bg-green-100"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Mark Paid
                              </button>
                            )}
                            <button
                              onClick={() => toggleExpand(r.id)}
                              className="flex items-center justify-center rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 hover:text-primary transition-all"
                            >
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <AnimatePresence>
            {expandedId !== null && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                {(() => {
                  const item = receivables.find((r) => r.id === expandedId)
                  if (!item) return null
                  return (
                    <div className="border-t border-gray-100 px-6 py-5 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-xl bg-gray-50/80 p-3">
                        <p className="text-xs text-gray-500 font-medium">Full Name</p>
                        <p className="text-sm text-gray-700 mt-0.5">{item.memberName}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50/80 p-3">
                        <p className="text-xs text-gray-500 font-medium">Reference</p>
                        <p className="text-sm text-gray-700 mt-0.5 font-mono">{item.reference}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50/80 p-3">
                        <p className="text-xs text-gray-500 font-medium">Type</p>
                        <p className="text-sm text-gray-700 mt-0.5">{item.type}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50/80 p-3">
                        <p className="text-xs text-gray-500 font-medium">Amount Due</p>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{formatCurrency(item.amountDue)}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50/80 p-3">
                        <p className="text-xs text-gray-500 font-medium">Due Date</p>
                        <p className="text-sm text-gray-700 mt-0.5">{formatDate(item.dueDate)}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50/80 p-3">
                        <p className="text-xs text-gray-500 font-medium">Status</p>
                        <p className={cn("text-sm font-medium mt-0.5", item.status === "paid" ? "text-green-600" : item.status === "overdue" ? "text-red-600" : "text-amber-600")}>
                          {statusLabels[item.status]}
                        </p>
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}
