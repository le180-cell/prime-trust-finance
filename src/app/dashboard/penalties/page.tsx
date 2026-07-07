"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle, Search, CheckCircle, Info, Clock, Shield,
  ChevronDown, ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

interface Penalty {
  id: number
  description: string
  reference: string
  amount: number
  imposedDate: string
  dueDate: string
  status: "pending" | "waived" | "paid"
  severity: "low" | "medium" | "high"
  reason: string
}

const mockPenalties: Penalty[] = [
  { id: 1, description: "Late Loan Installment", reference: "PEN-2026-001", amount: 25000, imposedDate: "2026-03-15", dueDate: "2026-04-14", status: "paid", severity: "medium", reason: "Installment payment was 5 days overdue" },
  { id: 2, description: "Missed Savings Deadline", reference: "PEN-2026-002", amount: 10000, imposedDate: "2026-04-01", dueDate: "2026-04-30", status: "waived", severity: "low", reason: "First-time offense, waived per board resolution" },
  { id: 3, description: "Default on Payment", reference: "PEN-2026-003", amount: 50000, imposedDate: "2026-05-10", dueDate: "2026-06-09", status: "pending", severity: "high", reason: "Payment default exceeding 30 days" },
  { id: 4, description: "Late Registration Fee", reference: "PEN-2026-004", amount: 15000, imposedDate: "2026-05-20", dueDate: "2026-06-19", status: "pending", severity: "low", reason: "Annual registration fee not paid on time" },
  { id: 5, description: "Emergency Loan Late Payment", reference: "PEN-2026-005", amount: 35000, imposedDate: "2026-06-01", dueDate: "2026-07-01", status: "pending", severity: "high", reason: "Emergency loan repayment past due" },
]

function StatusBadge({ status }: { status: string }) {
  if (status === "paid") return <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[10px] font-medium text-green-700"><CheckCircle className="h-3 w-3" /> Paid</span>
  if (status === "waived") return <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-medium text-blue-700"><Info className="h-3 w-3" /> Waived</span>
  return <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-medium text-red-700"><AlertTriangle className="h-3 w-3" /> Pending</span>
}

export default function PenaltiesPage() {
  const [penalties] = useState<Penalty[]>(mockPenalties)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const stats = {
    total: penalties.reduce((s, p) => s + p.amount, 0),
    pending: penalties.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0),
    paid: penalties.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0),
    waived: penalties.filter((p) => p.status === "waived").reduce((s, p) => s + p.amount, 0),
  }

  const filtered = penalties.filter((p) => {
    if (statusFilter !== "All" && p.status !== statusFilter.toLowerCase()) return false
    if (search && !p.description.toLowerCase().includes(search.toLowerCase()) && !p.reference.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-700 via-red-600 to-rose-800 p-6 text-white shadow-[0_24px_60px_rgba(185,28,28,0.2)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.2),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.15),transparent_26%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10"><Shield className="h-6 w-6" /></div>
              <div>
                <h1 className="font-heading text-2xl font-bold sm:text-3xl">Penalties</h1>
                <p className="text-sm text-white/65">Track and manage penalty charges</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"><p className="text-xs text-slate-500">Total Penalties</p><p className="mt-1 font-heading text-xl font-bold text-slate-900">RWF {new Intl.NumberFormat("en-US").format(stats.total)}</p></div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"><p className="text-xs text-slate-500">Pending</p><p className="mt-1 font-heading text-xl font-bold text-red-600">RWF {new Intl.NumberFormat("en-US").format(stats.pending)}</p></div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"><p className="text-xs text-slate-500">Paid</p><p className="mt-1 font-heading text-xl font-bold text-emerald-600">RWF {new Intl.NumberFormat("en-US").format(stats.paid)}</p></div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"><p className="text-xs text-slate-500">Waived</p><p className="mt-1 font-heading text-xl font-bold text-blue-600">RWF {new Intl.NumberFormat("en-US").format(stats.waived)}</p></div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search penalties..." className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 pl-10 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-xs font-medium text-slate-600 outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10">
            {["All", "Pending", "Paid", "Waived"].map((o) => <option key={o} value={o}>{o === "All" ? "All Statuses" : o}</option>)}
          </select>
        </motion.div>

        {filtered.length === 0 ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16">
            <CheckCircle className="h-14 w-14 text-emerald-300" />
            <p className="mt-4 text-lg font-medium text-slate-500">No penalties</p>
            <p className="text-sm text-slate-400">You have no penalty records.</p>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3.5 text-left font-medium text-slate-500">Description</th>
                  <th className="px-4 py-3.5 text-left font-medium text-slate-500">Ref.</th>
                  <th className="px-4 py-3.5 text-left font-medium text-slate-500">Amount</th>
                  <th className="px-4 py-3.5 text-left font-medium text-slate-500">Imposed</th>
                  <th className="px-4 py-3.5 text-left font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3.5 text-right font-medium text-slate-500">Details</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((p, i) => (
                    <motion.tr key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-slate-50 transition-all hover:bg-slate-50/50">
                      <td className="px-4 py-3.5"><span className="font-medium text-slate-800">{p.description}</span></td>
                      <td className="px-4 py-3.5"><span className="font-mono text-xs text-slate-400">{p.reference}</span></td>
                      <td className="px-4 py-3.5"><span className="font-medium text-slate-800">RWF {new Intl.NumberFormat("en-US").format(p.amount)}</span></td>
                      <td className="px-4 py-3.5"><span className="text-slate-500">{p.imposedDate}</span></td>
                      <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3.5 text-right">
                        <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary transition hover:underline">
                          {expandedId === p.id ? <>Less <ChevronUp className="h-3 w-3" /></> : <>More <ChevronDown className="h-3 w-3" /></>}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            <AnimatePresence>
              {expandedId !== null && (() => {
                const p = penalties.find((x) => x.id === expandedId)
                if (!p) return null
                return (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                    <div className="flex items-start gap-3">
                      <Info className="mt-0.5 h-4 w-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Reason</p>
                        <p className="mt-0.5 text-sm text-slate-500">{p.reason}</p>
                        <p className="mt-2 text-xs text-slate-400">Due Date: {p.dueDate} | Severity: {p.severity}</p>
                        {p.status === "pending" && <button className="mt-2 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5">Pay Now</button>}
                      </div>
                    </div>
                  </motion.div>
                )
              })()}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
