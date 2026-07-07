"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle, XCircle, HelpCircle, Search,
  ChevronDown, ChevronUp, DollarSign, Calendar,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

interface Loan {
  id: number
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
}

const mockLoans: Loan[] = [
  { id: 1, memberName: "Jean-Pierre Habimana", memberInitials: "JH", amount: 1500000, purpose: "Business Expansion", riskScore: "low", monthlyInstallment: 150000, status: "pending", dateRequested: "2026-05-28", duration: 12, collateral: "Land title deed", notes: "Returning customer with good repayment history." },
  { id: 2, memberName: "Alice Uwimana", memberInitials: "AU", amount: 800000, purpose: "Education", riskScore: "low", monthlyInstallment: 80000, status: "pending", dateRequested: "2026-06-01", duration: 12, collateral: "None (group guarantee)", notes: "Member of Urumuri cooperative." },
  { id: 3, memberName: "David Kagame", memberInitials: "DK", amount: 3000000, purpose: "Agriculture Equipment", riskScore: "medium", monthlyInstallment: 300000, status: "pending", dateRequested: "2026-05-25", duration: 18, collateral: "Farm equipment", notes: "High potential but seasonal income." },
  { id: 4, memberName: "Grace Mukamana", memberInitials: "GM", amount: 500000, purpose: "Emergency", riskScore: "low", monthlyInstallment: 50000, status: "approved", dateRequested: "2026-05-20", duration: 12, collateral: "Savings guarantee", notes: "Medical emergency loan." },
  { id: 5, memberName: "Patrick Niyonzima", memberInitials: "PN", amount: 2000000, purpose: "Home Renovation", riskScore: "medium", monthlyInstallment: 200000, status: "approved", dateRequested: "2026-05-15", duration: 24, collateral: "House title", notes: "Property renovation for rental income." },
  { id: 6, memberName: "Beatrice Imanishimwe", memberInitials: "BI", amount: 100000, purpose: "Petty Trade", riskScore: "high", monthlyInstallment: 12000, status: "rejected", dateRequested: "2026-05-10", duration: 6, collateral: "None", notes: "Insufficient credit history." },
  { id: 7, memberName: "Samuel Nkurunziza", memberInitials: "SN", amount: 1200000, purpose: "Business Expansion", riskScore: "low", monthlyInstallment: 120000, status: "completed", dateRequested: "2025-11-10", duration: 12, collateral: "Vehicle", notes: "Fully repaid." },
  { id: 8, memberName: "Chantal Uwase", memberInitials: "CU", amount: 600000, purpose: "Education", riskScore: "low", monthlyInstallment: 60000, status: "completed", dateRequested: "2025-08-15", duration: 12, collateral: "None", notes: "Completed with good standing." },
  { id: 9, memberName: "Olivier Mugisha", memberInitials: "OM", amount: 2500000, purpose: "Agriculture Equipment", riskScore: "high", monthlyInstallment: 250000, status: "pending", dateRequested: "2026-06-03", duration: 18, collateral: "Land title", notes: "New farmer cooperative member." },
  { id: 10, memberName: "Diane Nyiraneza", memberInitials: "DN", amount: 400000, purpose: "Emergency", riskScore: "medium", monthlyInstallment: 45000, status: "pending", dateRequested: "2026-06-05", duration: 9, collateral: "Group guarantee", notes: "Requires urgent disbursement." },
]

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

export default function AdminLoansPage() {
  const [loans] = useState<Loan[]>(mockLoans)
  const [loading] = useState(false)
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)

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

  function handleApprove(loan: Loan) {
    toast.success(`${loan.memberName}'s loan of ${formatCurrency(loan.amount)} approved`)
  }

  function handleReject(loan: Loan) {
    toast.error(`${loan.memberName}'s loan of ${formatCurrency(loan.amount)} rejected`)
  }

  function handleMoreInfo(loan: Loan) {
    toast(`Requested more info for ${loan.memberName}'s loan`, { icon: "ℹ️" })
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
                          <p className="text-xs text-gray-500 font-medium">Collateral</p>
                          <p className="text-sm text-gray-700 mt-0.5">{loan.collateral}</p>
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
                                className="flex items-center justify-center gap-1.5 flex-1 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-secondary/90"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(loan)}
                                className="flex items-center justify-center gap-1.5 flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-red-600"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Reject
                              </button>
                              <button
                                onClick={() => handleMoreInfo(loan)}
                                className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 px-3 py-2 text-xs font-medium text-amber-700 transition-all hover:bg-amber-50"
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
