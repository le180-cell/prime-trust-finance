"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle, XCircle, Search, Clock,
  BarChart3, TrendingUp, DollarSign,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

interface Application {
  id: number
  name: string
  initials: string
  amount: number
  purpose: string
  score: number
  savingsHistory: number[]
  contributionHistory: number[]
  eligibility: "eligible" | "incomplete" | "under_review"
  dateSubmitted: string
  occupation: string
}

const mockApplications: Application[] = [
  { id: 1, name: "Jean-Pierre Habimana", initials: "JH", amount: 1500000, purpose: "Business Expansion", score: 85, savingsHistory: [200000, 350000, 500000, 680000, 850000, 1000000], contributionHistory: [50000, 100000, 150000, 200000, 250000, 300000], eligibility: "eligible", dateSubmitted: "2026-06-01", occupation: "Shop Owner" },
  { id: 2, name: "Alice Uwimana", initials: "AU", amount: 800000, purpose: "Education", score: 72, savingsHistory: [100000, 180000, 250000, 320000, 400000, 480000], contributionHistory: [30000, 60000, 90000, 120000, 150000, 180000], eligibility: "eligible", dateSubmitted: "2026-05-28", occupation: "Teacher" },
  { id: 3, name: "David Kagame", initials: "DK", amount: 3000000, purpose: "Agriculture Equipment", score: 55, savingsHistory: [50000, 80000, 120000, 150000, 180000, 200000], contributionHistory: [10000, 20000, 30000, 40000, 50000, 60000], eligibility: "under_review", dateSubmitted: "2026-05-25", occupation: "Farmer" },
  { id: 4, name: "Grace Mukamana", initials: "GM", amount: 500000, purpose: "Emergency", score: 90, savingsHistory: [300000, 400000, 500000, 600000, 700000, 800000], contributionHistory: [80000, 120000, 160000, 200000, 240000, 280000], eligibility: "eligible", dateSubmitted: "2026-05-20", occupation: "Nurse" },
  { id: 5, name: "Patrick Niyonzima", initials: "PN", amount: 2000000, purpose: "Home Renovation", score: 45, savingsHistory: [50000, 60000, 70000, 80000, 90000, 100000], contributionHistory: [5000, 10000, 15000, 20000, 25000, 30000], eligibility: "incomplete", dateSubmitted: "2026-05-15", occupation: "Driver" },
  { id: 6, name: "Beatrice Imanishimwe", initials: "BI", amount: 100000, purpose: "Petty Trade", score: 65, savingsHistory: [40000, 60000, 80000, 100000, 120000, 140000], contributionHistory: [10000, 20000, 30000, 40000, 50000, 60000], eligibility: "under_review", dateSubmitted: "2026-05-10", occupation: "Market Vendor" },
  { id: 7, name: "Olivier Mugisha", initials: "OM", amount: 2500000, purpose: "Agriculture Equipment", score: 60, savingsHistory: [80000, 120000, 180000, 220000, 280000, 320000], contributionHistory: [15000, 30000, 45000, 60000, 75000, 90000], eligibility: "under_review", dateSubmitted: "2026-06-03", occupation: "Farmer" },
  { id: 8, name: "Chantal Uwase", initials: "CU", amount: 600000, purpose: "Education", score: 78, savingsHistory: [150000, 220000, 300000, 380000, 450000, 520000], contributionHistory: [40000, 70000, 100000, 130000, 160000, 190000], eligibility: "eligible", dateSubmitted: "2026-05-30", occupation: "Student" },
]

const eligibilityColors: Record<string, string> = {
  eligible: "bg-green-50 text-green-700 border-green-200",
  incomplete: "bg-amber-50 text-amber-700 border-amber-200",
  under_review: "bg-blue-50 text-blue-700 border-blue-200",
}

const eligibilityLabels: Record<string, string> = {
  eligible: "Eligible",
  incomplete: "Incomplete",
  under_review: "Under Review",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function MiniBar({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-[3px] h-10">
      {data.map((val, i) => (
        <div
          key={i}
          className="w-full rounded-sm transition-all hover:opacity-80"
          style={{
            height: `${Math.max((val / max) * 100, 15)}%`,
            backgroundColor: color,
            opacity: 0.5 + (i / data.length) * 0.5,
          }}
        />
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="admin-card p-5 animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-36 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-100" />
        </div>
      </div>
      <div className="h-6 w-24 rounded bg-gray-200" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-full rounded bg-gray-100" />
      </div>
      <div className="h-10 rounded-lg bg-gray-100" />
      <div className="flex gap-2">
        <div className="h-9 flex-1 rounded-lg bg-gray-100" />
        <div className="h-9 flex-1 rounded-lg bg-gray-100" />
      </div>
    </div>
  )
}

export default function AdminApprovalsPage() {
  const [applications] = useState<Application[]>(mockApplications)
  const [loading] = useState(false)
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")

  const pendingCount = applications.filter((a) => a.eligibility === "under_review").length

  const filtered = useMemo(() => {
    let result = applications
    if (filter !== "All") {
      const key = filter === "Pending Review" ? "under_review" : filter.toLowerCase()
      result = result.filter((a) => a.eligibility === key)
    }
    if (search) result = result.filter((a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.purpose.toLowerCase().includes(search.toLowerCase())
    )
    return result
  }, [applications, filter, search])

  function handleApprove(app: Application) {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Approve {formatCurrency(app.amount)} loan for {app.name}?</p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => { toast.dismiss(t.id); toast.success(`${app.name}'s loan approved`); }}
              className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-white hover:bg-secondary/90"
            >
              Confirm
            </button>
            <button
              onClick={() => { toast.dismiss(t.id); toast.error("Approval cancelled"); }}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 10000, id: `approve-${app.id}` }
    )
  }

  function handleReject(app: Application) {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Reject {app.name}&apos;s application?</p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => { toast.dismiss(t.id); toast.error(`${app.name}'s application rejected`); }}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >
              Confirm Reject
            </button>
            <button
              onClick={() => { toast.dismiss(t.id); toast.success("Rejection cancelled"); }}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 10000, id: `reject-${app.id}` }
    )
  }

  const tabs = [
    { key: "All", label: "All" },
    { key: "Pending Review", label: "Pending Review" },
    { key: "Eligible", label: "Eligible" },
    { key: "Incomplete", label: "Incomplete" },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={cardVariants} className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary sm:text-3xl flex items-center gap-3">
            Approval Center
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white">
                {pendingCount} pending
              </span>
            )}
          </h1>
          <p className="mt-1 text-gray-500">Review and process loan applications.</p>
        </div>
      </motion.div>

      <motion.div variants={cardVariants} className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicants..."
            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 pl-10 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "rounded-lg px-3.5 py-2 text-xs font-medium transition-all",
                filter === tab.key
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white/80 text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={cardVariants} className="admin-card flex flex-col items-center justify-center py-16">
          <Clock className="h-14 w-14 text-gray-300" />
          <p className="mt-4 text-lg font-medium text-gray-500">No pending approvals</p>
          <p className="mt-1 text-sm text-gray-400">All applications have been processed.</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence>
            {filtered.map((app, i) => (
              <motion.div
                key={app.id}
                variants={cardVariants}
                layout
                transition={{ delay: i * 0.04 }}
                className="admin-card overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white text-sm font-bold shadow-sm">
                        {app.initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{app.name}</p>
                        <p className="text-xs text-gray-400">{app.occupation}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium",
                      eligibilityColors[app.eligibility]
                    )}>
                      {eligibilityLabels[app.eligibility]}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-1">
                    <p className="font-heading text-xl font-bold text-primary">{formatCurrency(app.amount)}</p>
                    <p className="text-xs text-gray-400">{formatDate(app.dateSubmitted)}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{app.purpose}</p>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        Loan Score
                      </span>
                      <span className={cn(
                        "text-xs font-semibold",
                        app.score >= 80 ? "text-green-600" : app.score >= 60 ? "text-amber-600" : "text-red-500"
                      )}>
                        {app.score}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${app.score}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          app.score >= 80 ? "bg-green-500" : app.score >= 60 ? "bg-amber-500" : "bg-red-500"
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-gray-50/80 p-3">
                      <div className="flex items-center gap-1 mb-1.5">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-[10px] font-medium text-gray-500">Savings</span>
                      </div>
                      <MiniBar data={app.savingsHistory} color="#16A34A" />
                    </div>
                    <div className="rounded-xl bg-gray-50/80 p-3">
                      <div className="flex items-center gap-1 mb-1.5">
                        <DollarSign className="h-3 w-3 text-blue-500" />
                        <span className="text-[10px] font-medium text-gray-500">Contributions</span>
                      </div>
                      <MiniBar data={app.contributionHistory} color="#0B3C5D" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(app)}
                      className="flex items-center justify-center gap-1.5 flex-1 rounded-lg bg-secondary px-3 py-2.5 text-xs font-semibold text-white transition-all hover:bg-secondary/90 shadow-sm"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(app)}
                      className="flex items-center justify-center gap-1.5 flex-1 rounded-lg bg-red-500 px-3 py-2.5 text-xs font-semibold text-white transition-all hover:bg-red-600 shadow-sm"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}
