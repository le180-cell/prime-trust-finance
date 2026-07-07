"use client"

import { useState, useEffect, FormEvent } from "react"
import { motion } from "framer-motion"
import {
  Save, AlertTriangle, Gavel, Clock, Percent, DollarSign,
  CheckCircle, ShieldCheck, RefreshCw, Ban, SkipBack,
  Snowflake, Flame, User, FileText, CalendarDays,
} from "lucide-react"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

type PenaltyType = "fixed" | "percentage" | "daily_percentage" | "monthly_percentage"

interface PolicyData {
  gracePeriod: number
  penaltyType: PenaltyType
  penaltyRate: number
  penaltyFrequency: string
  maxPenalty: number
  autoCalc: boolean
  autoNotify: boolean
}

interface PenaltyEntry {
  id: number
  member: string
  loanId: string
  amountOverdue: number
  penaltyApplied: number
  date: string
  status: "Waived" | "Applied" | "Frozen"
}

const defaultPolicy: PolicyData = {
  gracePeriod: 3,
  penaltyType: "percentage",
  penaltyRate: 5,
  penaltyFrequency: "daily",
  maxPenalty: 1000000,
  autoCalc: true,
  autoNotify: true,
}

const penaltyTypes = [
  { value: "fixed", label: "Fixed Amount", desc: "Flat fee per penalty period" },
  { value: "percentage", label: "Percentage", desc: "% of overdue amount" },
  { value: "daily_percentage", label: "Daily Percentage", desc: "% of overdue amount per day" },
  { value: "monthly_percentage", label: "Monthly Percentage", desc: "% of overdue amount per month" },
]

const autoActions = [
  "Checks overdue loans daily",
  "Calculates penalties according to configured rules",
  "Updates outstanding balance",
  "Creates penalty history",
  "Updates finance",
  "Updates reports",
  "Notifies member",
  "Notifies administrator",
]

const samplePenalties: PenaltyEntry[] = [
  { id: 1, member: "Jean Baptiste", loanId: "LN-2024-0421", amountOverdue: 250000, penaltyApplied: 12500, date: "2026-06-15", status: "Applied" },
  { id: 2, member: "Alice Uwimana", loanId: "LN-2024-0387", amountOverdue: 180000, penaltyApplied: 0, date: "2026-06-12", status: "Waived" },
  { id: 3, member: "David Habimana", loanId: "LN-2024-0459", amountOverdue: 500000, penaltyApplied: 25000, date: "2026-06-10", status: "Applied" },
  { id: 4, member: "Marie Claire", loanId: "LN-2024-0293", amountOverdue: 320000, penaltyApplied: 16000, date: "2026-06-08", status: "Frozen" },
  { id: 5, member: "Patrick Mugisha", loanId: "LN-2024-0512", amountOverdue: 150000, penaltyApplied: 7500, date: "2026-06-05", status: "Applied" },
]

function SkeletonForm() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="admin-card p-6 space-y-5">
        <div className="h-6 w-56 rounded bg-gray-200" />
        <div className="grid gap-5 sm:grid-cols-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-28 rounded bg-gray-100" />
              <div className="h-11 w-full rounded-xl bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PenaltiesPolicyPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [policy, setPolicy] = useState<PolicyData>(defaultPolicy)
  const [penaltiesFrozen, setPenaltiesFrozen] = useState(false)
  const [penalties, setPenalties] = useState<PenaltyEntry[]>(samplePenalties)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ias-penalty-policy")
      if (stored) {
        const parsed = JSON.parse(stored) as { policy: PolicyData }
        setPolicy(parsed.policy)
      }
    } catch {
      // ignore
    }
    setLoading(false)
  }, [])

  function reducePenalty() {
    const amt = prompt("Enter amount to reduce penalty by (RWF):")
    if (amt && !isNaN(Number(amt))) {
      toast.success(`Penalty reduced by ${formatCurrency(Number(amt))}. This action will be recorded in Audit History.`)
    }
  }

  function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      localStorage.setItem("ias-penalty-policy", JSON.stringify({ policy }))
      toast.success("Penalty policy saved. Automatic enforcement active.")
    } catch {
      setError("Failed to save to local storage.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div className="mb-8" variants={sectionVariants}>
          <div className="h-8 w-64 rounded bg-gray-200 animate-pulse" />
          <div className="mt-2 h-4 w-72 rounded bg-gray-100 animate-pulse" />
        </motion.div>
        <SkeletonForm />
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32">
        <div className="admin-card rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 px-8 py-6 text-center max-w-md">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-red-700 dark:text-red-400 mb-1">{error}</h2>
          <p className="text-sm text-red-500 dark:text-red-400/80 mb-4">Could not load penalty policy configuration.</p>
          <button onClick={() => { setError(""); setLoading(true); try { const stored = localStorage.getItem("ias-penalty-policy"); if (stored) { const parsed = JSON.parse(stored); setPolicy(parsed.policy) } } catch {} setLoading(false) }}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div variants={sectionVariants} className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#0B3C5D] sm:text-3xl">Penalty Policy Management</h1>
          <p className="mt-1 text-gray-500">Configure overdue loan penalties, grace periods, and automatic enforcement.</p>
        </div>
        <button type="submit" form="penalty-form" disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-8 py-3 font-semibold text-white transition-all hover:bg-[#16A34A]/80 disabled:opacity-60 shadow-sm">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Policy"}
        </button>
      </motion.div>

      <form id="penalty-form" onSubmit={handleSave} className="space-y-6">
        <motion.div variants={sectionVariants} className="admin-card p-6 transition-all hover:shadow-md">
          <h2 className="font-heading text-lg font-semibold text-[#0B3C5D] mb-5 flex items-center gap-2">
            <Gavel className="h-5 w-5 text-[#16A34A]" />
            Penalty Configuration
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Grace Period (days)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="number" min="0" value={policy.gracePeriod}
                  onChange={(e) => setPolicy({ ...policy, gracePeriod: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Penalty Frequency</label>
              <select value={policy.penaltyFrequency}
                onChange={(e) => setPolicy({ ...policy, penaltyFrequency: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">Penalty Type</label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {penaltyTypes.map((pt) => (
                  <label key={pt.value} className={cn(
                    "cursor-pointer rounded-xl border-2 p-3 transition-all",
                    policy.penaltyType === pt.value ? "border-[#16A34A] bg-[#16A34A]/5 shadow-sm" : "border-gray-200 bg-white/40 hover:bg-white/60 hover:border-gray-300"
                  )}>
                    <input type="radio" name="penaltyType" value={pt.value} checked={policy.penaltyType === pt.value}
                      onChange={(e) => setPolicy({ ...policy, penaltyType: e.target.value as PenaltyType })}
                      className="sr-only" />
                    <p className="text-sm font-semibold text-[#0B3C5D]">{pt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{pt.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Penalty Rate {policy.penaltyType === "fixed" ? "(RWF)" : "(%)"}
              </label>
              <div className="relative">
                {policy.penaltyType === "fixed" ? (
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                ) : (
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                )}
                <input type="number" step="0.01" min="0" value={policy.penaltyRate}
                  onChange={(e) => setPolicy({ ...policy, penaltyRate: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Maximum Penalty (cap)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type={policy.penaltyType === "fixed" ? "number" : "number"} step="0.01" min="0" value={policy.maxPenalty}
                  onChange={(e) => setPolicy({ ...policy, maxPenalty: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white/50 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">Enable Automatic Calculation</p>
                  <p className="text-xs text-gray-400">System auto-calculates and applies penalties</p>
                </div>
                <button type="button"
                  onClick={() => setPolicy({ ...policy, autoCalc: !policy.autoCalc })}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                    policy.autoCalc ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-gray-100 text-gray-500"
                  )}>
                  {policy.autoCalc ? "Enabled" : "Disabled"}
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white/50 p-4 mt-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">Enable Automatic Notifications</p>
                  <p className="text-xs text-gray-400">Notify members and admins on penalty events</p>
                </div>
                <button type="button"
                  onClick={() => setPolicy({ ...policy, autoNotify: !policy.autoNotify })}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                    policy.autoNotify ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-gray-100 text-gray-500"
                  )}>
                  {policy.autoNotify ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants}
          className="admin-card p-6 transition-all hover:shadow-md bg-gradient-to-br from-[#16A34A]/5 to-transparent">
          <h2 className="font-heading text-lg font-semibold text-[#0B3C5D] mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#16A34A]" />
            What the system does automatically
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {autoActions.map((action) => (
              <div key={action} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-[#16A34A] flex-shrink-0" />
                {action}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="admin-card p-6 transition-all hover:shadow-md">
          <h2 className="font-heading text-lg font-semibold text-[#0B3C5D] mb-5 flex items-center gap-2">
            <Ban className="h-5 w-5 text-[#16A34A]" />
            Manual Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-100 bg-white/50 p-4 transition-all hover:bg-white/80 hover:shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <SkipBack className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-semibold text-gray-800">Waive Penalty</p>
              </div>
              <p className="text-xs text-gray-400 mb-3">Remove penalty from a member</p>
              <button type="button" onClick={() => { toast.success("Penalty waived. This action will be recorded in Audit History.") }}
                className="w-full rounded-lg bg-amber-50 text-amber-700 border border-amber-200 px-3 py-2 text-xs font-semibold hover:bg-amber-100 transition-colors">
                Waive Penalty
              </button>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white/50 p-4 transition-all hover:bg-white/80 hover:shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-semibold text-gray-800">Reduce Penalty</p>
              </div>
              <p className="text-xs text-gray-400 mb-3">Reduce amount by a specific value</p>
              <button type="button" onClick={reducePenalty}
                className="w-full rounded-lg bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 text-xs font-semibold hover:bg-blue-100 transition-colors">
                Reduce Penalty
              </button>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white/50 p-4 transition-all hover:bg-white/80 hover:shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Snowflake className={cn("h-4 w-4", penaltiesFrozen ? "text-blue-500" : "text-gray-400")} />
                <p className="text-sm font-semibold text-gray-800">Freeze Penalties</p>
              </div>
              <p className="text-xs text-gray-400 mb-3">Pause all penalty accruals</p>
              <button type="button" onClick={() => { setPenaltiesFrozen(true); toast.success("Penalties frozen. This action will be recorded in Audit History.") }}
                className={cn("w-full rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  penaltiesFrozen ? "bg-blue-100 text-blue-700 cursor-not-allowed" : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100")}
                disabled={penaltiesFrozen}>
                {penaltiesFrozen ? "Frozen" : "Freeze Penalties"}
              </button>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white/50 p-4 transition-all hover:bg-white/80 hover:shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Flame className={cn("h-4 w-4", penaltiesFrozen ? "text-orange-500" : "text-gray-400")} />
                <p className="text-sm font-semibold text-gray-800">Resume Penalties</p>
              </div>
              <p className="text-xs text-gray-400 mb-3">Reactivate penalty accruals</p>
              <button type="button" onClick={() => { setPenaltiesFrozen(false); toast.success("Penalties resumed. This action will be recorded in Audit History.") }}
                className={cn("w-full rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  penaltiesFrozen ? "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100" : "bg-gray-100 text-gray-400 cursor-not-allowed")}
                disabled={!penaltiesFrozen}>
                {penaltiesFrozen ? "Resume Penalties" : "Resume Penalties"}
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400 flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            Each action will be recorded in Audit History.
          </p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-100 px-5 py-3 text-sm text-red-600">
            {error}
          </motion.div>
        )}
      </form>

      <motion.div variants={sectionVariants} className="admin-card p-6 transition-all hover:shadow-md mt-6">
        <h2 className="font-heading text-lg font-semibold text-[#0B3C5D] mb-5 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[#16A34A]" />
          Penalty History Preview
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Member</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Loan ID</th>
                <th className="text-right py-3 px-3 text-gray-500 font-medium">Amount Overdue</th>
                <th className="text-right py-3 px-3 text-gray-500 font-medium">Penalty Applied</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Date</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {penalties.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-medium text-gray-800">{p.member}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-600">{p.loanId}</td>
                  <td className="py-3 px-3 text-right text-gray-800 font-medium">{formatCurrency(p.amountOverdue)}</td>
                  <td className="py-3 px-3 text-right text-gray-800 font-medium">{formatCurrency(p.penaltyApplied)}</td>
                  <td className="py-3 px-3 text-gray-600">{formatDate(p.date)}</td>
                  <td className="py-3 px-3">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                      p.status === "Applied" && "bg-green-50 text-green-700 border border-green-200",
                      p.status === "Waived" && "bg-amber-50 text-amber-700 border border-amber-200",
                      p.status === "Frozen" && "bg-blue-50 text-blue-700 border border-blue-200",
                    )}>
                      {p.status === "Applied" && <CheckCircle className="h-3 w-3" />}
                      {p.status === "Waived" && <Ban className="h-3 w-3" />}
                      {p.status === "Frozen" && <Snowflake className="h-3 w-3" />}
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
