"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowUpRight, ArrowDownRight, Search, Filter, Download, Printer,
  TrendingUp, TrendingDown, RotateCcw, Receipt, CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const MONTHS = ["All Months", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

interface Transaction {
  id: number; type: "credit" | "debit"; amount: number
  description: string; date: string; status: string; category: string
}

interface DashboardData {
  recentTransactions: Transaction[]
  summary: { totalDepositsThisYear: number; totalWithdrawalsThisYear: number }
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  if (s === "completed" || s === "success") {
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{status}</span>
  }
  if (s === "pending") {
    return <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-600"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{status}</span>
  }
  return <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-red-500"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />{status}</span>
}

function Skeleton({ className = "" }: { className?: string }) { return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} /> }

function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-36 rounded-3xl" />
      <Skeleton className="h-14 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

export default function PaymentsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "credit" | "debit">("all")
  const [monthFilter, setMonthFilter] = useState("All Months")
  const [categoryFilter, setCategoryFilter] = useState("All")

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d: DashboardData & { error?: string }) => {
        if (d.error) { setError(d.error); return }
        setData(d)
      })
      .catch(() => setError("Failed to load payments"))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    if (!data) return []
    return ["All", ...Array.from(new Set(data.recentTransactions.map((t) => t.category)))]
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    return data.recentTransactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false
      if (categoryFilter !== "All" && tx.category !== categoryFilter) return false
      if (monthFilter !== "All Months") {
        if (new Date(tx.date).toLocaleString("en-US", { month: "long" }) !== monthFilter) return false
      }
      if (search) {
        const q = search.toLowerCase()
        if (!tx.description.toLowerCase().includes(q) && !tx.category.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [data, typeFilter, categoryFilter, monthFilter, search])

  const totals = useMemo(() => {
    if (!data) return { credits: 0, debits: 0, net: 0 }
    const credits = data.recentTransactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0)
    const debits = data.recentTransactions.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0)
    return { credits, debits, net: credits - debits }
  }, [data])

  if (loading) return <PageSkeleton />

  if (error || !data) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800">{error || "Something went wrong"}</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5">Try Again</button>
        </div>
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10">
                <Receipt className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold sm:text-3xl">My Payments</h1>
                <p className="text-sm text-white/65">Your complete payment history</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/50">Total Credits</p>
                <p className="mt-1 font-heading text-xl font-bold text-emerald-300">+RWF {new Intl.NumberFormat("en-US").format(totals.credits)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/50">Total Debits</p>
                <p className="mt-1 font-heading text-xl font-bold text-red-300">-RWF {new Intl.NumberFormat("en-US").format(totals.debits)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/50">Net Change</p>
                <p className={`mt-1 font-heading text-xl font-bold ${totals.net >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                  {totals.net >= 0 ? "+" : "-"}RWF {new Intl.NumberFormat("en-US").format(Math.abs(totals.net))}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by description or category..."
                className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
            </div>
            <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10">
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="flex gap-1 rounded-xl bg-slate-50 p-1">
              {(["all", "credit", "debit"] as const).map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={cn("flex items-center gap-1.5 rounded-[10px] px-3.5 py-1.5 text-xs font-semibold transition-all",
                    typeFilter === t ? "bg-white text-primary shadow-[0_2px_8px_rgba(15,23,42,0.06)]" : "text-slate-400 hover:text-slate-600")}>
                  {t === "all" ? <RotateCcw className="h-3.5 w-3.5" /> : t === "credit" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {t === "all" ? "All" : t === "credit" ? "Credits" : "Debits"}
                </button>
              ))}
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">Payment History</h3>
              <p className="text-sm text-slate-500">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""} found</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
          <div className="space-y-1">
            <AnimatePresence>
              {filtered.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16">
                  <Search className="mb-3 h-10 w-10 text-slate-200" />
                  <p className="text-sm font-medium text-slate-400">No payments match your filters</p>
                  <button onClick={() => { setSearch(""); setTypeFilter("all"); setMonthFilter("All Months"); setCategoryFilter("All") }}
                    className="mt-3 rounded-xl bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100">Clear Filters</button>
                </motion.div>
              ) : (
                filtered.map((tx, i) => (
                  <motion.div key={tx.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ delay: i * 0.025 }}
                    className="flex items-center justify-between rounded-xl px-4 py-3.5 transition-colors hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tx.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500")}>
                        {tx.type === "credit" ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{tx.description}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-slate-400">{tx.date}</span>
                          <span className="inline-block rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">{tx.category}</span>
                          <StatusBadge status={tx.status} />
                        </div>
                      </div>
                    </div>
                    <p className={cn("text-sm font-bold", tx.type === "credit" ? "text-emerald-600" : "text-red-500")}>
                      {tx.type === "credit" ? "+" : "-"}RWF {new Intl.NumberFormat("en-US").format(tx.amount)}
                    </p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
