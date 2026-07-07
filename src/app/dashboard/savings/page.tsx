"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  PiggyBank, TrendingUp, ArrowUpRight, Download, Sparkles, Target, Calendar,
  ChevronDown, ArrowDownToLine, FileDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
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
  return <span>{prefix}{new Intl.NumberFormat("en-US").format(display)}{suffix}</span>
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />
}

function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-44 rounded-3xl" />
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
  user: { firstName: string; lastName: string }
  savings: {
    balance: number; monthlyContributions: number; interestEarned: number
    growthRate: number
    history: Array<{ month: string; amount: number; contributions: number }>
  }
  recentTransactions: Array<{
    id: number; type: "credit" | "debit"; amount: number
    description: string; date: string; status: string; category: string
  }>
  goals: Array<{
    id: number; name: string; target: number; current: number; expectedCompletion: string
  }>
  summary: { totalDepositsThisYear: number }
}

export default function SavingsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d: DashboardData & { error?: string }) => {
        if (d.error) { setError(d.error); return }
        setData(d)
      })
      .catch(() => setError("Failed to load savings"))
      .finally(() => setLoading(false))
  }, [])

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

  const { savings, recentTransactions, goals, summary } = data
  const creditTransactions = recentTransactions.filter((t) => t.type === "credit")
  const dividendEarned = Math.round(savings.interestEarned * 0.12)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0E4F75] to-[#06263C] p-6 text-white shadow-[0_24px_60px_rgba(11,60,93,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.14),transparent_26%)]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                  <PiggyBank className="h-6 w-6 text-accent" />
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                  {savings.growthRate > 0 ? `+${savings.growthRate}%` : `${savings.growthRate}%`} growth
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-white/60">Total Savings Balance</p>
              <p className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                RWF {new Intl.NumberFormat("en-US").format(savings.balance)}
              </p>
              <div className="mt-4 flex flex-wrap gap-6">
                <div>
                  <p className="text-[11px] font-medium text-white/50">Interest Earned (YTD)</p>
                  <p className="mt-0.5 text-sm font-semibold text-emerald-300">
                    +RWF {new Intl.NumberFormat("en-US").format(savings.interestEarned)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-white/50">Monthly Contribution</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    RWF {new Intl.NumberFormat("en-US").format(savings.monthlyContributions)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20">
                <ArrowDownToLine className="mr-2 inline h-4 w-4" /> Deposit
              </button>
              <button className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-md transition hover:bg-white/20">
                <FileDown className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Saved", value: savings.balance, icon: PiggyBank, color: "from-primary to-[#0E4F75]", trend: savings.growthRate },
            { label: "Interest Earned", value: savings.interestEarned, icon: TrendingUp, color: "from-secondary to-emerald-600", trend: 8.1 },
            { label: "Monthly Contribution", value: savings.monthlyContributions, icon: Target, color: "from-amber-500 to-orange-600", trend: 0 },
            { label: "Dividend Earned", value: dividendEarned, icon: Sparkles, color: "from-violet-500 to-purple-600", trend: 5.4 },
          ].map(({ label, value, icon: Icon, color, trend }) => (
            <motion.div key={label} variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                  <span className={cn("inline-block h-0 w-0 border-l-[4px] border-r-[4px]",
                    trend >= 0 ? "border-b-[5px] border-b-emerald-500 border-l-transparent border-r-transparent" : "border-t-[5px] border-t-red-500 border-l-transparent border-r-transparent")} />
                  {Math.abs(trend)}%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-1 font-heading text-2xl font-bold tracking-tight text-slate-900">
                  <AnimatedNumber value={value} prefix="RWF " />
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">Savings Growth</h3>
                <p className="text-sm text-slate-500">Your balance over time</p>
              </div>
              <div className="flex gap-1 rounded-xl bg-slate-50 p-1">
                {(["6m", "1y", "all"] as const).map((r) => (
                  <button key={r} className="rounded-[10px] px-3 py-1.5 text-xs font-semibold text-slate-400 transition-all hover:text-slate-600">
                    {r === "6m" ? "6 Months" : r === "1y" ? "1 Year" : "All"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 h-72">
              <div className="flex h-full items-center justify-center rounded-xl bg-gradient-to-br from-primary/[0.02] to-transparent border border-dashed border-slate-200">
                <div className="text-center">
                  <TrendingUp className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-400">Chart renders with live data</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-5">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
              <h3 className="font-heading text-lg font-bold text-slate-900">Savings Goals</h3>
              <p className="text-sm text-slate-500">Track your targets</p>
              <div className="mt-5 space-y-5">
                {goals.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">No goals set yet.</p>
                ) : (
                  goals.map((goal) => {
                    const pct = Math.min(100, Math.round((goal.current / goal.target) * 100))
                    return (
                      <div key={goal.id}>
                        <div className="mb-1.5 flex items-center justify-between">
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
                  })
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">Dividend Forecast</h3>
                  <p className="text-sm text-slate-500">Projected annual return</p>
                </div>
              </div>
              <div className="mt-5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-emerald-600">Estimated Dividend</p>
                <p className="mt-1 font-heading text-3xl font-bold text-emerald-700">
                  RWF {new Intl.NumberFormat("en-US").format(dividendEarned)}
                </p>
                <p className="mt-1 text-xs text-emerald-600/70">Based on current savings balance and interest rate</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">Recent Savings Activity</h3>
              <p className="text-sm text-slate-500">Your latest credit transactions</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
          <div className="mt-5 space-y-1">
            {creditTransactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No savings activity yet.</p>
            ) : (
              creditTransactions.slice(0, 8).map((tx, i) => (
                <motion.div key={tx.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{tx.description}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">{tx.date}</span>
                        <span className="inline-block rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">{tx.category}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-emerald-600">
                    +RWF {new Intl.NumberFormat("en-US").format(tx.amount)}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
