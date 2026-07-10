"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  PiggyBank, Landmark, TrendingUp, CreditCard,
  Target, ShieldCheck, Sparkles, Award, ArrowRight,
  Phone, Mail, MapPin, Briefcase, Calendar, Wallet,
  Clock, CheckCircle2, AlertTriangle, Percent,
} from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
}

function AnimatedNumber({ value, prefix = "", suffix = "", className = "" }: { value: number; prefix?: string; suffix?: string; className?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const duration = 1200
    const steps = 40
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(Math.round(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])
  return <span className={className}>{prefix}{new Intl.NumberFormat("en-US").format(display)}{suffix}</span>
}

function MiniSparkline({ data, color = "#0B3C5D" }: { data: number[]; color?: string }) {
  if (!data.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80, h = 28
  const points = data.map((v, i) => `${(i / (data.length - 1 || 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ")
  return (
    <svg className="absolute bottom-3 right-3 w-20 h-7 opacity-40" viewBox={`0 0 ${w} ${h}`}>
      <path d={`M ${points}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-40 rounded-3xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  )
}

interface DashboardData {
  user: {
    id: number; email: string; username: string | null; role: string
    firstName: string; lastName: string; fullName: string; memberId: string
    phone: string; district: string; occupation: string; employer: string
    monthlyIncome: number; profilePhoto: string | null; memberSince: string
    verified: boolean
  }
  savings: {
    balance: number; monthlyContributions: number; interestEarned: number
    growthRate: number; history: Array<{ month: string; amount: number; contributions: number }>
  }
  loan: {
    amount: number; remainingBalance: number; monthlyInstallment: number
    interest: number; disbursementDate: string; dueDate: string
    paidMonths: number; totalMonths: number; status: string
    paymentSchedule: Array<{ month: string; amount: number; paid: boolean; dueDate: string }>
  } | null
  creditScore: number; availableLoanLimit: number
  recentTransactions: Array<{
    id: number; type: "credit" | "debit"; amount: number
    description: string; date: string; status: string; category: string
  }>
  goals: Array<{
    id: number; name: string; target: number; current: number; expectedCompletion: string
  }>
  financialHealth: {
    savingHabit: string; contributionConsistency: number
    repaymentScore: number; recommendedMaxLoan: number; advice: string
  }
  summary: {
    totalDepositsThisYear: number; totalWithdrawalsThisYear: number
    loanRepaymentProgress: number; nextContributionDate: string; currentMonth: string
  }
}

const quickActions = [
  { label: "Apply for Loan", icon: Landmark, color: "from-primary to-[#0E4F75]", href: "/dashboard/loan-applications", desc: "Get financing" },
  { label: "Deposit Savings", icon: PiggyBank, color: "from-secondary to-emerald-600", href: "/dashboard/savings", desc: "Grow your savings" },
  { label: "Pay Installment", icon: CreditCard, color: "from-amber-500 to-orange-600", href: "/dashboard/payments", desc: "Make a payment" },
  { label: "Download Statement", icon: Target, color: "from-violet-500 to-purple-600", href: "/dashboard/statements", desc: "Export records" },
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => { if (!r.ok) throw new Error("Unauthorized"); return r.json() })
      .then((d: DashboardData) => { setData(d) })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />

  if (error || !data) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800">{error || "Something went wrong"}</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const { user, savings, loan, goals, recentTransactions, financialHealth, summary } = data

  const sparklineData = savings.history.map((h) => h.amount)
  const sparklineContributions = savings.history.map((h) => h.contributions)

  const totalPayments = recentTransactions.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0)
  const totalCredits = recentTransactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0E4F75] to-[#06263C] p-6 text-white shadow-[0_24px_60px_rgba(11,60,93,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.14),transparent_26%)]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[18px] border-2 border-white/20 bg-white/10 text-xl font-bold shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                {user.profilePhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profilePhoto} alt="" className="h-full w-full object-cover" />
                ) : (
                  `${user.firstName[0]}${user.lastName[0]}`
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-heading text-2xl font-bold sm:text-3xl">{user.fullName}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                    <ShieldCheck className="h-3 w-3" /> {user.verified ? "Verified" : "Pending"}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/65">
                  <span>{user.memberId}</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>Active Member</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-center backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/50">Credit Score</p>
                <p className="font-heading text-xl font-bold">{data.creditScore}/100</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-md">
                <Award className="h-6 w-6 text-accent" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon
            return (
              <motion.a
                key={action.label}
                href={action.href}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-[0_4px_12px_rgba(15,23,42,0.04)] transition-all hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg transition-all group-hover:scale-110`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[13px] font-semibold text-slate-700">{action.label}</span>
                  <p className="text-[10px] text-slate-400">{action.desc}</p>
                </div>
              </motion.a>
            )
          })}
        </div>

        <motion.div variants={itemVariants} className="rounded-3xl border border-slate-100 bg-gradient-to-br from-primary/5 via-white to-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#0E4F75]">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-heading text-base font-bold text-slate-900">Digital Wallet</h2>
                <p className="text-xs text-slate-400">Your financial overview at a glance</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Savings Balance", value: savings.balance, icon: PiggyBank, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Outstanding Loan", value: loan?.remainingBalance || 0, icon: Landmark, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Available Limit", value: data.availableLoanLimit, icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Interest Earned", value: savings.interestEarned, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400">{item.label}</p>
                  <AnimatedNumber value={item.value} prefix="RWF " className="mt-0.5 font-heading text-lg font-bold text-slate-900" />
                  <MiniSparkline data={sparklineData} color={item.color.includes("emerald") ? "#16A34A" : item.color.includes("amber") ? "#F4B400" : "#0B3C5D"} />
                </div>
              )
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Savings Balance", value: savings.balance, prefix: "RWF ", trend: savings.growthRate, icon: PiggyBank, color: "from-primary to-[#0E4F75]", delay: 0, sparkline: sparklineData },
            { label: "Outstanding Loan", value: loan?.remainingBalance || 0, prefix: "RWF ", trend: loan ? -12 : 0, icon: Landmark, color: "from-amber-500 to-orange-600", delay: 0.05 },
            { label: "Monthly Installment", value: loan?.monthlyInstallment || 0, prefix: "RWF ", trend: 0, icon: Clock, color: "from-secondary to-emerald-600", delay: 0.1 },
            { label: "Available Loan Limit", value: data.availableLoanLimit, prefix: "RWF ", trend: 5, icon: CreditCard, color: "from-violet-500 to-purple-600", delay: 0.15, sparkline: sparklineContributions },
          ].map((card) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.label}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    (card.trend || 0) >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  )}>
                    <span className={cn("inline-block h-0 w-0 border-l-[4px] border-r-[4px]",
                      (card.trend || 0) >= 0 ? "border-b-[5px] border-b-emerald-500 border-l-transparent border-r-transparent" : "border-t-[5px] border-t-red-500 border-l-transparent border-r-transparent"
                    )} />
                    {Math.abs(card.trend || 0)}%
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <AnimatedNumber value={card.value} prefix={card.prefix || ""} className="mt-1 font-heading text-2xl font-bold tracking-tight text-slate-900" />
                </div>
                {card.sparkline && <MiniSparkline data={card.sparkline} />}
              </motion.div>
            )
          })}
        </div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-gradient-to-br from-secondary/5 to-transparent p-5 sm:p-6">
          <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-secondary" />
            Financial Insights
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Saving Consistency", value: `${financialHealth.contributionConsistency}%`, desc: financialHealth.savingHabit, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Repayment Score", value: `${financialHealth.repaymentScore}/100`, desc: "Your repayment history", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Max Loan Eligibility", value: `RWF ${new Intl.NumberFormat("en-US").format(financialHealth.recommendedMaxLoan)}`, desc: financialHealth.advice, icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Loan Status", value: loan?.status || "No Active Loan", desc: loan ? `${loan.paidMonths}/${loan.totalMonths} months paid` : "Apply today", icon: CheckCircle2, color: "text-violet-600", bg: "bg-violet-50" },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-xl border border-slate-100 bg-white p-4 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <p className="text-xs font-medium text-slate-400">{item.label}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{item.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">Savings Growth</h3>
                <p className="text-sm text-slate-500">Your savings balance over time</p>
              </div>
              <div className="flex gap-1 rounded-xl bg-slate-50 p-1">
                {(["6m", "1y", "all"] as const).map((r) => (
                  <button key={r} className="rounded-[10px] px-3 py-1.5 text-xs font-semibold text-slate-400 transition-all hover:text-slate-600 data-[active=true]:bg-white data-[active=true]:text-primary data-[active=true]:shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                    {r === "6m" ? "6 Months" : r === "1y" ? "1 Year" : "All"}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72" id="savings-chart-placeholder">
              <div className="flex h-full items-center justify-center rounded-xl bg-gradient-to-br from-primary/[0.02] to-transparent border border-dashed border-slate-200">
                <div className="text-center">
                  <TrendingUp className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-400">Chart will render with live data</p>
                  <p className="text-xs text-slate-300">
                    {savings.history.length} data points available
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-5">
            {loan && (
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
                <h3 className="font-heading text-lg font-bold text-slate-900">Loan Status</h3>
                <p className="text-sm text-slate-500">Development Loan</p>
                <div className="mt-5 flex items-center justify-center">
                  <div className="relative flex h-28 w-28 items-center justify-center">
                    <svg className="h-28 w-28 -rotate-90" viewBox="0 0 112 112">
                      <circle cx="56" cy="56" r="47" fill="none" stroke="#F1F5F9" strokeWidth="7" />
                      <circle cx="56" cy="56" r="47" fill="none" stroke="#0B3C5D" strokeWidth="7" strokeDasharray={`${2 * Math.PI * 47}`} strokeDashoffset={`${2 * Math.PI * 47 * (1 - loan.paidMonths / loan.totalMonths)}`} strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute text-center">
                      <p className="font-heading text-xl font-bold text-slate-900">{Math.round((loan.paidMonths / loan.totalMonths) * 100)}%</p>
                      <p className="text-[11px] font-medium text-slate-400">Paid</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-2.5">
                  {[
                    ["Loan Amount", `RWF ${new Intl.NumberFormat("en-US").format(loan.amount)}`],
                    ["Remaining", `RWF ${new Intl.NumberFormat("en-US").format(loan.remainingBalance)}`],
                    ["Installment", `RWF ${new Intl.NumberFormat("en-US").format(loan.monthlyInstallment)}`],
                    ["Due", new Date(loan.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-none">
                      <span className="text-sm text-slate-500">{label}</span>
                      <span className="text-sm font-semibold text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
              <h3 className="font-heading text-lg font-bold text-slate-900">Savings Goals</h3>
              <p className="text-sm text-slate-500">Track your targets</p>
              <div className="mt-5 space-y-4">
                {goals.map((goal) => {
                  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100))
                  return (
                    <div key={goal.id}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">{goal.name}</span>
                        <span className="text-xs font-semibold text-slate-500">{pct}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${pct >= 100 ? "bg-secondary" : "bg-primary"}`} />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span>RWF {new Intl.NumberFormat("en-US").format(goal.current)}</span>
                        <span>Target: RWF {new Intl.NumberFormat("en-US").format(goal.target)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-sm text-slate-500">Your latest account activity</p>
            </div>
            <a href="/dashboard/payments" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              View All <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <div className="space-y-1">
            {recentTransactions.slice(0, 5).map((tx, i) => (
              <motion.div key={tx.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tx.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                    {tx.type === "credit" ? <TrendingUp className="h-4 w-4" /> : <TrendingUp className="h-4 w-4 rotate-180" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400">{tx.date}</span>
                      <span className="inline-block rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">{tx.category}</span>
                    </div>
                  </div>
                </div>
                <p className={`text-sm font-bold ${tx.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                  {tx.type === "credit" ? "+" : "-"}RWF {new Intl.NumberFormat("en-US").format(tx.amount)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
            <h3 className="font-heading text-lg font-bold text-slate-900">Profile Summary</h3>
            <div className="mt-5 space-y-4">
              {[
                { icon: Phone, label: "Phone", value: user.phone },
                { icon: Mail, label: "Email", value: user.email },
                { icon: MapPin, label: "District", value: user.district },
                { icon: Briefcase, label: "Occupation", value: user.occupation },
                { icon: Calendar, label: "Member Since", value: new Date(user.memberSince).toLocaleDateString("en-US", { year: "numeric", month: "long" }) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">{label}</p>
                    <p className="text-sm font-medium text-slate-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
            <h3 className="font-heading text-lg font-bold text-slate-900">Quick Summary</h3>
            <div className="mt-5 space-y-4">
              {[
                { label: "Total Deposits (YTD)", value: `RWF ${new Intl.NumberFormat("en-US").format(summary.totalDepositsThisYear)}`, color: "text-emerald-600" },
                { label: "Total Payments (YTD)", value: `RWF ${new Intl.NumberFormat("en-US").format(totalPayments)}`, color: "text-red-500" },
                { label: "Loan Repayment Progress", value: `${summary.loanRepaymentProgress}%`, color: "text-primary" },
                { label: "Next Contribution", value: new Date(summary.nextContributionDate).toLocaleDateString("en-US", { month: "long", day: "numeric" }), color: "text-slate-800" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-slate-100 bg-white p-4">
              <p className="text-xs font-medium text-slate-400">{summary.currentMonth} Financial Health</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{financialHealth.advice}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
