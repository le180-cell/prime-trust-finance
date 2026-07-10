"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, Download, Eye, Calendar, ChevronDown, Search, Printer,
  TrendingUp, TrendingDown, FileDown, CheckCircle,
} from "lucide-react"
import { cn, formatCurrency, formatDate } from "@/lib/utils"

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

interface Statement {
  id: number
  period: string
  month: number
  year: number
  type: string
  totalCredits: number
  totalDebits: number
  openingBalance: number
  closingBalance: number
  generatedDate: string
  downloaded: boolean
}

export default function StatementsPage() {
  const [statements, setStatements] = useState<Statement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/dashboard/statements")
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((data) => { setStatements(data); setLoading(false) })
      .catch(() => { setStatements([]); setLoading(false) })
  }, [])

  const filtered = statements.filter((s) => {
    if (typeFilter !== "All" && s.type !== typeFilter) return false
    if (search && !s.period.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0E4F75] to-[#06263C] p-6 text-white shadow-[0_24px_60px_rgba(11,60,93,0.18)] sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.14),transparent_26%)]" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10"><FileText className="h-6 w-6 text-accent" /></div>
                <div>
                  <h1 className="font-heading text-2xl font-bold sm:text-3xl">Statements</h1>
                  <p className="text-sm text-white/65">Download monthly, quarterly & annual statements</p>
                </div>
              </div>
            </div>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex animate-pulse items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-slate-100" />
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded bg-slate-100" />
                  <div className="h-3 w-60 rounded bg-slate-100" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-100" />
                <div className="h-8 w-8 rounded-lg bg-slate-100" />
                <div className="h-8 w-8 rounded-lg bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0E4F75] to-[#06263C] p-6 text-white shadow-[0_24px_60px_rgba(11,60,93,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.14),transparent_26%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10"><FileText className="h-6 w-6 text-accent" /></div>
              <div>
                <h1 className="font-heading text-2xl font-bold sm:text-3xl">Statements</h1>
                <p className="text-sm text-white/65">Download monthly, quarterly & annual statements</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by period..." className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 pl-10 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-xs font-medium text-slate-600 outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10">
            {["All", "Monthly", "Quarterly", "Annual"].map((o) => <option key={o} value={o}>{o === "All" ? "All Types" : o}</option>)}
          </select>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16">
                <FileText className="h-14 w-14 text-slate-200" />
                <p className="mt-4 text-lg font-medium text-slate-500">No statements found</p>
              </motion.div>
            ) : (
              filtered.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: i * 0.04 }}
                  className={cn("rounded-2xl border bg-white transition-all hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]", expandedId === s.id ? "border-primary/20 shadow-[0_8px_24px_rgba(15,23,42,0.06)]" : "border-slate-100")}>
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-heading font-bold text-slate-800">{s.period}<span className="ml-2 text-[10px] font-normal text-slate-400">{s.type}</span></p>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-500" />{formatCurrency(s.totalCredits)}</span>
                          <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-red-500" />{formatCurrency(s.totalDebits)}</span>
                          <span className="text-slate-300">|</span>
                          <span>Balance: {formatCurrency(s.closingBalance)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:border-slate-300">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:border-slate-300">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:border-slate-300">
                        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expandedId === s.id && "rotate-180")} />
                      </button>
                    </div>
                  </div>
                  {expandedId === s.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div><p className="text-[10px] uppercase tracking-wider text-slate-400">Opening Balance</p><p className="mt-1 font-bold text-slate-800">{formatCurrency(s.openingBalance)}</p></div>
                        <div><p className="text-[10px] uppercase tracking-wider text-slate-400">Closing Balance</p><p className="mt-1 font-bold text-slate-800">{formatCurrency(s.closingBalance)}</p></div>
                        <div><p className="text-[10px] uppercase tracking-wider text-slate-400">Total Credits</p><p className="mt-1 font-bold text-emerald-700">+{formatCurrency(s.totalCredits)}</p></div>
                        <div><p className="text-[10px] uppercase tracking-wider text-slate-400">Total Debits</p><p className="mt-1 font-bold text-red-700">-{formatCurrency(s.totalDebits)}</p></div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5"><Download className="h-3.5 w-3.5" /> Download PDF</button>
                        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"><Printer className="h-3.5 w-3.5" /> Print</button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}
