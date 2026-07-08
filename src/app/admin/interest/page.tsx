"use client"

import { useState, useEffect, useMemo, FormEvent } from "react"
import { motion } from "framer-motion"
import {
  Save, Percent, BadgeCheck, BadgeAlert, DollarSign,
  Banknote, Calculator, RefreshCw, AlertTriangle,
  FileText, Clock,
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import toast from "react-hot-toast"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

type InterestType = "flat" | "reducing"
type InterestPeriod = "monthly" | "quarterly" | "annually"

interface PolicyData {
  interestType: InterestType
  rate: number
  period: InterestPeriod
  minDuration: number
  maxDuration: number
  minAmount: number
  maxAmount: number
  autoCalc: boolean
}

const defaultPolicy: PolicyData = {
  interestType: "flat",
  rate: 12,
  period: "monthly",
  minDuration: 1,
  maxDuration: 60,
  minAmount: 50000,
  maxAmount: 50000000,
  autoCalc: true,
}

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
      <div className="admin-card p-6 space-y-4">
        <div className="h-6 w-44 rounded bg-gray-200" />
        <div className="h-40 w-full rounded-xl bg-gray-100" />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: "active" | "configured" | "not-configured" }) {
  if (status === "not-configured") return null
  const config = {
    active: { icon: BadgeCheck, label: "Active", className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300" },
    configured: { icon: BadgeAlert, label: "Configured", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300" },
  }
  const { icon: Icon, label, className } = config[status]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold", className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

export default function InterestPolicyPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [policy, setPolicy] = useState<PolicyData>(defaultPolicy)
  const [savedPolicy, setSavedPolicy] = useState<PolicyData | null>(null)
  const [status, setStatus] = useState<"active" | "configured" | "not-configured">("not-configured")

  const [previewAmount, setPreviewAmount] = useState(1000000)
  const [previewDuration, setPreviewDuration] = useState(12)

  useEffect(() => {
    fetch("/api/admin/interest-policies")
      .then(r => r.json())
      .then((data: Record<string, unknown>[]) => {
        const loanPolicy = data.find((p: Record<string, unknown>) => p.type === "loan")
        if (loanPolicy) {
          const p: PolicyData = { interestType: "flat", rate: loanPolicy.rate as number, period: "monthly", minDuration: 1, maxDuration: 60, minAmount: 50000, maxAmount: 50000000, autoCalc: true }
          setPolicy(p); setSavedPolicy(p); setStatus("configured")
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const preview = useMemo(() => {
    if (!previewAmount || !previewDuration) return null
    const principal = previewAmount
    const annualRate = policy.rate
    const months = previewDuration
    const years = months / 12
    let interest: number
    let totalRepayment: number
    let monthlyPayment: number

    if (policy.interestType === "flat") {
      interest = principal * (annualRate / 100) * years
      totalRepayment = principal + interest
      monthlyPayment = totalRepayment / months
    } else {
      const monthlyRate = annualRate / 100 / 12
      if (monthlyRate === 0) {
        interest = 0
        monthlyPayment = principal / months
        totalRepayment = principal
      } else {
        monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
        totalRepayment = monthlyPayment * months
        interest = totalRepayment - principal
      }
    }

    const remainingSchedule = Array.from({ length: Math.min(months, 12) }, (_, i) => {
      const month = i + 1
      const paidSoFar = monthlyPayment * month
      const remaining = totalRepayment - paidSoFar
      return { month, remainingInterest: Math.max(0, interest * (1 - month / months)), remainingBalance: Math.max(0, remaining) }
    })

    return { interest: Math.round(interest), totalRepayment: Math.round(totalRepayment), monthlyPayment: Math.round(monthlyPayment), schedule: remainingSchedule }
  }, [previewAmount, previewDuration, policy.interestType, policy.rate])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/admin/interest-policies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policies: [{ name: "Loan Interest Standard", rate: policy.rate, type: "loan", minBalance: 0, maxBalance: 999999999, active: 1 }] }),
      })
      if (!res.ok) { setError("Failed to save policy"); return }
      setSavedPolicy(policy)
      setStatus("configured")
      toast.success("Interest policy saved.")
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div className="mb-8" variants={sectionVariants}>
          <div className="h-8 w-72 rounded bg-gray-200 animate-pulse" />
          <div className="mt-2 h-4 w-64 rounded bg-gray-100 animate-pulse" />
        </motion.div>
        <SkeletonForm />
      </motion.div>
    )
  }

  if (error && !savedPolicy) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32">
        <div className="admin-card rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 px-8 py-6 text-center max-w-md">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-red-700 dark:text-red-400 mb-1">{error}</h2>
          <p className="text-sm text-red-500 dark:text-red-400/80 mb-4">Could not load interest policy configuration.</p>
          <button onClick={() => { setError(""); setLoading(true); fetch("/api/admin/interest-policies").then(r => r.json()).then((data: Record<string, unknown>[]) => { const p = data.find((x: Record<string, unknown>) => x.type === "loan"); if (p) { const pp: PolicyData = { interestType: "flat", rate: p.rate as number, period: "monthly", minDuration: 1, maxDuration: 60, minAmount: 50000, maxAmount: 50000000, autoCalc: true }; setPolicy(pp); setSavedPolicy(pp); setStatus("configured") } }).catch(() => {}).finally(() => setLoading(false)) }}
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
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-[#0B3C5D] sm:text-3xl">Interest Policy Management</h1>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1 text-gray-500">Configure loan interest rates, periods, and automatic calculation rules.</p>
        </div>
        <button type="submit" form="interest-form" disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-8 py-3 font-semibold text-white transition-all hover:bg-[#16A34A]/80 disabled:opacity-60 shadow-sm">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Policy"}
        </button>
      </motion.div>

      <form id="interest-form" onSubmit={handleSave} className="space-y-6">
        <motion.div variants={sectionVariants} className="admin-card p-6 transition-all hover:shadow-md">
          <h2 className="font-heading text-lg font-semibold text-[#0B3C5D] mb-5 flex items-center gap-2">
            <Percent className="h-5 w-5 text-[#16A34A]" />
            Interest Rate Configuration
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">Interest Type</label>
              <div className="flex gap-3">
                {(["flat", "reducing"] as const).map((type) => (
                  <label key={type} className={cn(
                    "flex-1 cursor-pointer rounded-xl border-2 p-4 transition-all text-center",
                    policy.interestType === type ? "border-[#16A34A] bg-[#16A34A]/5 shadow-sm" : "border-gray-200 bg-white/40 hover:bg-white/60 hover:border-gray-300"
                  )}>
                    <input type="radio" name="interestType" value={type} checked={policy.interestType === type}
                      onChange={(e) => setPolicy({ ...policy, interestType: e.target.value as InterestType })}
                      className="sr-only" />
                    <p className="font-heading font-semibold text-[#0B3C5D] capitalize">{type === "flat" ? "Flat Rate" : "Reducing Balance"}</p>
                    <p className="text-xs text-gray-400 mt-1">{type === "flat" ? "Simple interest on principal" : "Amortized reducing balance"}</p>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Interest Rate (%)</label>
              <div className="space-y-2">
                <input type="number" step="0.1" min="0" max="100" value={policy.rate}
                  onChange={(e) => setPolicy({ ...policy, rate: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
                <input type="range" min="0" max="50" step="0.5" value={policy.rate}
                  onChange={(e) => setPolicy({ ...policy, rate: parseFloat(e.target.value) })}
                  className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-[#16A34A] cursor-pointer" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Interest Period</label>
              <select value={policy.period}
                onChange={(e) => setPolicy({ ...policy, period: e.target.value as InterestPeriod })}
                className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Minimum Duration (months)</label>
              <input type="number" min="1" value={policy.minDuration}
                onChange={(e) => setPolicy({ ...policy, minDuration: parseInt(e.target.value) || 1 })}
                className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Maximum Duration (months)</label>
              <input type="number" min="1" value={policy.maxDuration}
                onChange={(e) => setPolicy({ ...policy, maxDuration: parseInt(e.target.value) || 1 })}
                className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Minimum Loan Amount (RWF)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="number" min="0" value={policy.minAmount}
                  onChange={(e) => setPolicy({ ...policy, minAmount: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Maximum Loan Amount (RWF)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="number" min="0" value={policy.maxAmount}
                  onChange={(e) => setPolicy({ ...policy, maxAmount: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white/50 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">Enable Automatic Interest Calculation</p>
                  <p className="text-xs text-gray-400">Auto-calculate interest on new loans based on this policy</p>
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
            </div>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="admin-card p-6 transition-all hover:shadow-md">
          <h2 className="font-heading text-lg font-semibold text-[#0B3C5D] mb-5 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-[#16A34A]" />
            Auto-Calculated Preview
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Test Loan Amount (RWF)</label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="number" min="0" value={previewAmount}
                  onChange={(e) => setPreviewAmount(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Test Duration (months)</label>
              <input type="number" min="1" value={previewDuration}
                onChange={(e) => setPreviewDuration(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
            </div>
          </div>

          {preview ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-gradient-to-br from-[#0B3C5D]/5 to-transparent border border-[#0B3C5D]/10 p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Calculated Interest</p>
                <p className="font-heading text-xl font-bold text-[#0B3C5D]">{formatCurrency(preview.interest)}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#16A34A]/5 to-transparent border border-[#16A34A]/10 p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Total Repayment</p>
                <p className="font-heading text-xl font-bold text-[#16A34A]">{formatCurrency(preview.totalRepayment)}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#F4B400]/5 to-transparent border border-[#F4B400]/10 p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Monthly Installment</p>
                <p className="font-heading text-xl font-bold text-[#F4B400]">{formatCurrency(preview.monthlyPayment)}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10 p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Term</p>
                <p className="font-heading text-xl font-bold text-blue-600">{previewDuration} mo</p>
              </div>
              {preview.schedule.length > 0 && (
                <div className="sm:col-span-2 lg:col-span-4">
                  <p className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Remaining Interest Over Time (first {preview.schedule.length} months)
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-2 px-2 text-gray-500 font-medium">Month</th>
                          <th className="text-right py-2 px-2 text-gray-500 font-medium">Remaining Interest</th>
                          <th className="text-right py-2 px-2 text-gray-500 font-medium">Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.schedule.map((row) => (
                          <tr key={row.month} className="border-b border-gray-50 last:border-0">
                            <td className="py-2 px-2 text-gray-700">{row.month}</td>
                            <td className="py-2 px-2 text-right text-gray-700">{formatCurrency(Math.round(row.remainingInterest))}</td>
                            <td className="py-2 px-2 text-right text-gray-700">{formatCurrency(Math.round(row.remainingBalance))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Enter loan amount and duration to see the preview.</p>
          )}
        </motion.div>

        <motion.div variants={sectionVariants}
          className="flex items-start gap-3 rounded-xl bg-[#F4B400]/10 border border-[#F4B400]/20 p-4 text-sm">
          <FileText className="h-5 w-5 flex-shrink-0 mt-0.5 text-[#B8860B]" />
          <p className="text-[#B8860B]">
            <strong>Important Note:</strong> The interest rate applied when a loan is approved remains fixed for the loan&apos;s lifetime, even if future rates change.
          </p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-100 px-5 py-3 text-sm text-red-600">
            {error}
          </motion.div>
        )}
      </form>

      {savedPolicy && (
        <motion.div variants={sectionVariants} className="admin-card p-6 transition-all hover:shadow-md mt-6">
          <h2 className="font-heading text-lg font-semibold text-[#0B3C5D] mb-4 flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-[#16A34A]" />
            Current Active Policy
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Interest Type</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{savedPolicy.interestType === "flat" ? "Flat Rate" : "Reducing Balance"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Interest Rate</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{savedPolicy.rate}% ({savedPolicy.period})</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Loan Amount Range</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{formatCurrency(savedPolicy.minAmount)} – {formatCurrency(savedPolicy.maxAmount)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Duration Range</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{savedPolicy.minDuration} – {savedPolicy.maxDuration} months</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Auto Calculation</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{savedPolicy.autoCalc ? "Enabled" : "Disabled"}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
