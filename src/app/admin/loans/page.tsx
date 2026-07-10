"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle, XCircle, HelpCircle, Search,
  ChevronDown, ChevronUp, DollarSign, Calendar,
  AlertCircle, RefreshCw,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

interface Loan {
  id: number
  memberId: number
  memberName: string
  memberInitials: string
  amount: number
  purpose: string
  riskScore: "low" | "medium" | "high"
  monthlyInstallment: number
  status: "pending" | "approved" | "rejected" | "completed"
  dateRequested: string
  duration: number
  collateral: string
  notes: string
  productName: string
  interestRate: number
}

const riskColors: Record<string, string> = {
  low: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function SkeletonCard() {
  return (
    <div className="admin-card p-5 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-3 w-24 rounded bg-gray-100" />
        </div>
      </div>
      <div className="h-6 w-28 rounded bg-gray-200" />
      <div className="h-3 w-full rounded bg-gray-100" />
      <div className="h-3 w-3/4 rounded bg-gray-100" />
      <div className="flex gap-2">
        <div className="h-8 flex-1 rounded-lg bg-gray-100" />
        <div className="h-8 flex-1 rounded-lg bg-gray-100" />
      </div>
    </div>
  )
}

function computeRiskScore(amount: number): "low" | "medium" | "high" {
  if (amount >= 2000000) return "high"
  if (amount >= 1000000) return "medium"
  return "low"
}

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const mounted = useRef(false)

  const fetchLoans = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch("/api/admin/loans")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      if (!mounted.current) return
      const mapped: Loan[] = (data as Array<Record<string, unknown>>).map((item: any) => ({
        id: item.id,
        memberId: item.memberId,
        memberName: `${item.firstName || ""} ${item.lastName || ""}`.trim(),
        memberInitials: `${(item.firstName || "")[0] || ""}${(item.lastName || "")[0] || ""}`,
        amount: item.amount,
        purpose: item.purpose || item.productName || "N/A",
        riskScore: computeRiskScore(item.amount),
        monthlyInstallment: item.monthlyPayment || 0,
        status: item.status,
        dateRequested: item.appliedAt,
        duration: item.tenure || 0,
        collateral: item.productName || "Not specified",
        notes: item.notes || "No notes",
        productName: item.productName || "General",
        interestRate: item.interestRate || 0,
      }))
      setLoans(mapped)
    } catch {
      if (mounted.current) setError(true)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    fetchLoans()
    return () => { mounted.current = false }
  }, [fetchLoans])

  const handleRetry = useCallback(() => {
    fetchLoans()
  }, [fetchLoans])

  const counts = useMemo(() => ({
    all: loans.length,
    pending: loans.filter((l) => l.status === "pending").length,
    approved: loans.filter((l) => l.status === "approved").length,
    rejected: loans.filter((l) => l.status === "rejected").length,
    completed: loans.filter((l) => l.status === "completed").length,
  }), [loans])

  const filtered = useMemo(() => {
    let result = loans
    if (filter !== "All") result = result.filter((l) => l.status === filter.toLowerCase())
    if (search) result = result.filter((l) =>
      l.memberName.toLowerCase().includes(search.toLowerCase()) ||
      l.purpose.toLowerCase().includes(search.toLowerCase())
    )
    return result
  }, [loans, filter, search])

  const updateLoanStatus = useCallback(async (loan: Loan, newStatus: string, message: string) => {
    setActionLoading(loan.id)
    try {
      const res = await fetch("/api/admin/loans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: loan.id, status: newStatus }),
      })
      if (!res.ok) throw new Error("Request failed")
      setLoans((prev) =>
        prev.map((l) => l.id === loan.id ? { ...l, status: newStatus as Loan["status"] } : l)
      )
      toast.success(message)
    } catch {
      toast.error(`Failed to ${newStatus} loan. Please try again.`)
    } finally {
      setActionLoading(null)
    }
  }, [])

  function handleApprove(loan: Loan) {
    updateLoanStatus(loan, "approved", `${loan.memberName}'s loan of ${formatCurrency(loan.amount)} approved`)
  }

  function handleReject(loan: Loan) {
    updateLoanStatus(loan, "rejected", `${loan.memberName}'s loan of ${formatCurrency(loan.amount)} rejected`)
  }

  async function handleMoreInfo(loan: Loan) {
    setActionLoading(loan.id)
    try {
      const res = await fetch("/api/admin/loans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: loan.id, status: "pending", notes: "More information requested" }),
      })
      if (!res.ok) throw new Error("Request failed")
      toast(`Requested more info for ${loan.memberName}'s loan`, { icon: "ℹ️" })
    } catch {
      toast.error("Failed to request more info")
    } finally {
      setActionLoading(null)
    }
  }

  function toggleExpand(id: number) {
    setExpandedId((prev) => prev === id ? null : id)
  }

  const tabs = [
    { key: "All", label: "All", count: counts.all },
    { key: "Pending", label: "Pending", count: counts.pending },
    { key: "Approved", label: "Approved", count: counts.approved },
    { key: "Rejected", label: "Rejected", count: counts.rejected },
    { key: "Completed", label: "Completed", count: counts.completed },
  ]

  if (error) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-14 w-14 text-red-300" />
        <p className="mt-4 text-lg font-medium text-gray-600">Failed to load loan applications</p>
        <p className="mt-1 text-sm text-gray-400">Something went wrong. Please try again.</p>
        <button
          onClick={handleRetry}
          className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-light"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={cardVariants} className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary sm:text-3xl flex items-center gap-3">
            Loan Management
          </h1>
          <p className="mt-1 text-gray-500">
            <span className="font-semibold text-amber-600">{counts.pending} pending</span>
            {" · "}
            <span className="font-semibold text-green-600">{counts.approved} approved</span>
            {" · "}
            <span className="font-semibold text-red-600">{counts.rejected} rejected</span>
            {" · "}
            <span className="font-semibold text-blue-600">{counts.completed} completed</span>
          </p>
        </div>
      </motion.div>

      <motion.div variants={cardVariants} className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or purpose..."
            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 pl-10 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all",
                filter === tab.key
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white/80 text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
            >
              {tab.label}
              <span className={cn(
                "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold min-w-[18px]",
                filter === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={cardVariants} className="admin-card flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-14 w-14 text-gray-300" />
          <p className="mt-4 text-lg font-medium text-gray-500">No loans found</p>
          <p className="mt-1 text-sm text-gray-400">{filter !== "All" ? `No ${filter.toLowerCase()} loans match your criteria.` : "No loans have been created yet."}</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((loan, i) => (
              <motion.div
                key={loan.id}
                variants={cardVariants}
                layout
                transition={{ delay: i * 0.04 }}
                className="admin-card overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="p-5 cursor-pointer" onClick={() => toggleExpand(loan.id)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white text-sm font-bold shadow-sm">
                        {loan.memberInitials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{loan.memberName}</p>
                        <p className="text-xs text-gray-400">{formatDate(loan.dateRequested)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      {expandedId === loan.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  <p className="font-heading text-xl font-bold text-primary mb-1">{formatCurrency(loan.amount)}</p>
                  <p className="text-sm text-gray-600 mb-3">{loan.purpose}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      riskColors[loan.riskScore]
                    )}>
                      Risk: {loan.riskScore.charAt(0).toUpperCase() + loan.riskScore.slice(1)}
                    </span>
                    <span className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      statusColors[loan.status]
                    )}>
                      {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(loan.monthlyInstallment)}/mo
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {loan.duration} months
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === loan.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                        <div className="rounded-xl bg-gray-50/80 p-3">
                          <p className="text-xs text-gray-500 font-medium">Product</p>
                          <p className="text-sm text-gray-700 mt-0.5">{loan.productName}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50/80 p-3">
                          <p className="text-xs text-gray-500 font-medium">Notes</p>
                          <p className="text-sm text-gray-700 mt-0.5">{loan.notes}</p>
                        </div>

                        <div className="flex gap-2 pt-1">
                          {loan.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(loan)}
                                disabled={actionLoading === loan.id}
                                className="flex items-center justify-center gap-1.5 flex-1 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-secondary/90 disabled:opacity-50"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                {actionLoading === loan.id ? "..." : "Approve"}
                              </button>
                              <button
                                onClick={() => handleReject(loan)}
                                disabled={actionLoading === loan.id}
                                className="flex items-center justify-center gap-1.5 flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-50"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                {actionLoading === loan.id ? "..." : "Reject"}
                              </button>
                              <button
                                onClick={() => handleMoreInfo(loan)}
                                disabled={actionLoading === loan.id}
                                className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 px-3 py-2 text-xs font-medium text-amber-700 transition-all hover:bg-amber-50 disabled:opacity-50"
                                title="Request more info"
                              >
                                <HelpCircle className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          {(loan.status === "approved" || loan.status === "completed") && (
                            <span className="flex-1 text-center text-xs text-green-600 font-medium py-2">
                              {loan.status === "approved" ? "Loan Approved" : "Loan Completed"}
                            </span>
                          )}
                          {loan.status === "rejected" && (
                            <span className="flex-1 text-center text-xs text-red-500 font-medium py-2">
                              Loan Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}
