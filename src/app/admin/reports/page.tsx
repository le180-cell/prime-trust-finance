"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, Clock, Calendar, BarChart3, TrendingUp, DollarSign,
  HandCoins, ArrowUpCircle, Users, Download, X, ChevronDown,
  FileSpreadsheet, FileType,
} from "lucide-react"
import { formatDate, cn } from "@/lib/utils"

const reportTypes = [
  { id: "daily", label: "Daily Reports", icon: Clock, desc: "Day-to-day operational summaries and metrics" },
  { id: "weekly", label: "Weekly Reports", icon: Calendar, desc: "Weekly performance reviews and trends" },
  { id: "monthly", label: "Monthly Reports", icon: BarChart3, desc: "Comprehensive monthly financial analysis" },
  { id: "annual", label: "Annual Reports", icon: TrendingUp, desc: "Year-end statements and growth reports" },
  { id: "financial", label: "Financial Statements", icon: DollarSign, desc: "Balance sheets, income statements, P&L" },
  { id: "loans", label: "Loan Reports", icon: HandCoins, desc: "Loan disbursement and repayment summaries" },
  { id: "contributions", label: "Contribution Reports", icon: ArrowUpCircle, desc: "Member savings and contribution tracking" },
  { id: "members", label: "Member Reports", icon: Users, desc: "Member demographics and activity reports" },
]

const mockRecentReports = [
  { id: 1, name: "Daily Summary - Jul 1", type: "Daily", generated: "2026-07-01T08:00:00", status: "Completed" },
  { id: 2, name: "Weekly Report - W26", type: "Weekly", generated: "2026-06-30T12:00:00", status: "Completed" },
  { id: 3, name: "Monthly Report - June", type: "Monthly", generated: "2026-06-30T23:00:00", status: "Completed" },
  { id: 4, name: "Q2 Financial Statement", type: "Financial", generated: "2026-06-30T23:00:00", status: "Processing" },
  { id: 5, name: "Loan Performance H1", type: "Loan Reports", generated: "2026-06-28T10:00:00", status: "Completed" },
]

const lastGeneratedMap: Record<string, string> = {
  daily: "2026-07-01T08:00:00",
  weekly: "2026-06-30T12:00:00",
  monthly: "2026-06-30T23:00:00",
  annual: "2026-01-01T00:00:00",
  financial: "2026-06-30T23:00:00",
  loans: "2026-06-28T10:00:00",
  contributions: "2026-06-25T14:00:00",
  members: "2026-06-20T09:00:00",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function ReportsPage() {
  const [loading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [genType, setGenType] = useState("daily")
  const [genFormat, setGenFormat] = useState("pdf")
  const [genFrom, setGenFrom] = useState("")
  const [genTo, setGenTo] = useState("")
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 1500))
    setGenerating(false)
    setShowModal(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-gray-200" />
        <div className="h-4 w-64 rounded bg-gray-100" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="admin-card p-5">
              <div className="h-10 w-10 rounded-xl bg-gray-100" />
              <div className="mt-3 h-5 w-28 rounded bg-gray-200" />
              <div className="mt-1 h-3 w-40 rounded bg-gray-100" />
              <div className="mt-3 flex gap-2">
                <div className="h-8 w-16 rounded-lg bg-gray-100" />
                <div className="h-8 w-16 rounded-lg bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#0B3C5D] sm:text-3xl">Report Center</h1>
          <p className="mt-1 text-gray-500">Generate and download premium reports.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#16A34A]/80 shadow-sm"
        >
          <FileText className="h-4 w-4" />
          Generate Report
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((rt) => {
          const Icon = rt.icon
          const lastGen = lastGeneratedMap[rt.id]
          return (
            <motion.div
              key={rt.id}
              whileHover={{ y: -4, boxShadow: "0 12px 32px -8px rgba(0,0,0,0.08)" }}
              className="admin-card group relative overflow-hidden p-5 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B3C5D]/5 text-[#0B3C5D] group-hover:bg-[#0B3C5D] group-hover:text-white transition-all">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading font-semibold text-gray-900">{rt.label}</h3>
                  <p className="text-xs text-gray-500 truncate">{rt.desc}</p>
                </div>
              </div>
              {lastGen && (
                <p className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last: {formatDate(lastGen)}
                </p>
              )}
              <div className="mt-3 flex gap-1.5">
                {["PDF", "Excel", "CSV"].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => {}}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50 hover:border-gray-300"
                  >
                    <Download className="h-3 w-3" />
                    {fmt}
                  </button>
                ))}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="mt-8 admin-card overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-heading text-lg font-semibold text-[#0B3C5D]">Recent Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-6 py-3.5 text-left font-medium text-gray-500">Name</th>
                <th className="px-6 py-3.5 text-left font-medium text-gray-500">Type</th>
                <th className="px-6 py-3.5 text-left font-medium text-gray-500">Generated</th>
                <th className="px-6 py-3.5 text-left font-medium text-gray-500">Status</th>
                <th className="px-6 py-3.5 text-right font-medium text-gray-500">Download</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentReports.map((r, i) => (
                <motion.tr
                  key={r.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-50 transition-all hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">{r.name}</td>
                  <td className="px-6 py-4 text-gray-600">{r.type}</td>
                  <td className="px-6 py-4 text-gray-400">{formatDate(r.generated)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      r.status === "Completed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                    )}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {["PDF", "CSV"].map((fmt) => (
                        <button key={fmt} className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50">
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {mockRecentReports.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No reports generated yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
            >
              <div className="admin-card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-heading text-lg font-semibold text-[#0B3C5D]">Generate Report</h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Report Type</label>
                    <div className="relative">
                      <select
                        value={genType}
                        onChange={(e) => setGenType(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 pr-10 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all"
                      >
                        {reportTypes.map((rt) => (
                          <option key={rt.id} value={rt.id}>{rt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">From</label>
                      <input
                        type="date" value={genFrom} onChange={(e) => setGenFrom(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">To</label>
                      <input
                        type="date" value={genTo} onChange={(e) => setGenTo(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Format</label>
                    <div className="flex gap-3">
                      {[
                        { id: "pdf", label: "PDF", icon: FileText },
                        { id: "excel", label: "Excel", icon: FileSpreadsheet },
                        { id: "csv", label: "CSV", icon: FileType },
                      ].map((fmt) => {
                        const FmtIcon = fmt.icon
                        return (
                          <button
                            key={fmt.id}
                            onClick={() => setGenFormat(fmt.id)}
                            className={cn(
                              "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-all",
                              genFormat === fmt.id
                                ? "border-[#16A34A] bg-[#16A34A]/5 text-[#16A34A]"
                                : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                            )}
                          >
                            <FmtIcon className="h-4 w-4" />
                            {fmt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#16A34A] py-3 font-semibold text-white transition-all hover:bg-[#16A34A]/80 disabled:opacity-60"
                    >
                      {generating ? "Generating..." : "Generate"}
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
