"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Users, HandCoins, PiggyBank, ArrowUpCircle, Activity, DollarSign,
  FileText, ShieldCheck, RefreshCw, TrendingUp, UserPlus, FileDown,
  CheckCircle, Bell, Database, Server, HardDrive, Wifi,
  ChevronRight, Clock, AlertTriangle, X, Search, CreditCard,
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { cn, formatCurrency } from "@/lib/utils"

/* ─── Types ─── */

interface StatCardConfig {
  label: string
  value: number
  trend: number
  trendUp: boolean
  sparkline: { v: number }[]
  icon: React.ComponentType<{ className?: string }>
  gradient: string
}

/* ─── Helpers ─── */

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function getActivityMeta(action: string) {
  const l = action.toLowerCase()
  if (/member|register|sign/i.test(l)) return { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" }
  if (/loan|credit|borrow/i.test(l)) return { icon: HandCoins, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" }
  if (/contribution|deposit|saving|dividend/i.test(l)) return { icon: ArrowUpCircle, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20" }
  if (/payment|paid|transaction|transfer/i.test(l)) return { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" }
  if (/statement|report|download|export/i.test(l)) return { icon: FileDown, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" }
  if (/testimonial|review/i.test(l)) return { icon: Bell, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" }
  if (/penalty|fine/i.test(l)) return { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" }
  return { icon: Activity, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-900/20" }
}

function makeSparkline(total: number, pts = 7): { v: number }[] {
  if (total === 0) return Array.from({ length: pts }, (_, i) => ({ v: Math.round(100 * (1 + i * 0.1)) }))
  const base = total / pts
  const arr: { v: number }[] = []
  for (let i = 0; i < pts; i++) {
    arr.push({ v: Math.round(base * (1 + i * 0.06 + Math.random() * 0.08)) })
  }
  arr[arr.length - 1] = { v: total }
  return arr
}

function computeTrend(spark: { v: number }[]): { trend: number; trendUp: boolean } {
  if (spark.length < 2 || spark[0].v === 0) return { trend: 0, trendUp: true }
  const pct = ((spark[spark.length - 1].v - spark[0].v) / spark[0].v) * 100
  return { trend: Math.abs(Math.round(pct * 10) / 10), trendUp: pct >= 0 }
}

/* ─── Quick Actions ─── */

const quickActions = [
  { label: "Add Member", icon: UserPlus, href: "/admin/members", gradient: "from-[#0B3C5D] to-blue-600" },
  { label: "New Loan", icon: HandCoins, href: "/admin/loans", gradient: "from-emerald-500 to-emerald-600" },
  { label: "Reports", icon: FileText, href: "/admin/reports", gradient: "from-amber-400 to-amber-500" },
  { label: "Analytics", icon: TrendingUp, href: "/admin/reports", gradient: "from-violet-500 to-violet-600" },
]

/* ─── Variants ─── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
}

/* ─── Hooks ─── */

function useAnimatedCounter(target: number, duration = 1000) {
  const [value, setValue] = useState(0)
  const ref = useRef<number | null>(null)
  useEffect(() => {
    if (ref.current) cancelAnimationFrame(ref.current)
    const start = performance.now()
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      setValue(Math.round(0 + (target - 0) * (1 - Math.pow(1 - p, 3))))
      if (p < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [target, duration])
  return value
}

/* ─── Sub-components ─── */

function DashboardSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between"><div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" /><div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl bg-white dark:bg-gray-900 p-3 border border-gray-100 dark:border-gray-800"><div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" /><div className="mt-2 h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" /><div className="mt-1 h-3 w-14 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ card, index }: { card: StatCardConfig; index: number }) {
  const Icon = card.icon
  const count = useAnimatedCounter(card.value)
  const displayValue = ["Total Savings", "Total Payments", "Total Deposits"].includes(card.label)
    ? formatCurrency(count)
    : ["Loan Recovery", "System Health"].includes(card.label)
      ? `${count}%`
      : count.toLocaleString()

  return (
    <motion.div variants={cardVariants}
      className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-3 lg:p-3.5 border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-8 w-8 lg:h-9 lg:w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br", card.gradient, "text-white shadow-xs")}>
          <Icon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{card.label}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm lg:text-base font-bold text-gray-900 dark:text-white">{displayValue}</p>
            <span className={cn("flex items-center gap-0.5 text-[10px] font-semibold shrink-0", card.trendUp ? "text-green-500" : "text-red-500")}>
              <TrendingUp className={cn("h-2.5 w-2.5", !card.trendUp && "rotate-180")} />
              {card.trendUp ? "+" : ""}{card.trend}%
            </span>
          </div>
        </div>
        <div className="hidden lg:block h-8 w-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={card.sparkline}>
              <defs>
                <linearGradient id={`sg-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={card.trendUp ? "#16A34A" : "#EF4444"} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={card.trendUp ? "#16A34A" : "#EF4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={card.trendUp ? "#16A34A" : "#EF4444"} strokeWidth={1.5} fill={`url(#sg-${index})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg px-2.5 py-1.5 text-xs">
      <p className="font-medium text-gray-900 dark:text-white mb-0.5">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="font-semibold">{formatCurrency(p.value)}</p>)}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    approved: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    rejected: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    active: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    failed: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  }
  return (
    <span className={cn("px-1.5 py-0.5 text-[10px] font-semibold rounded-full capitalize", map[status] || "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400")}>
      {status}
    </span>
  )
}

/* ─── Main ─── */

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [statCardsConfig, setStatCardsConfig] = useState<StatCardConfig[]>([])
  const [loanRequests, setLoanRequests] = useState<any[]>([])
  const [recentPayments, setRecentPayments] = useState<any[]>([])
  const [recentMembers, setRecentMembers] = useState<any[]>([])
  const [activityFeed, setActivityFeed] = useState<any[]>([])
  const [monthlySavingsData, setMonthlySavingsData] = useState<any[]>([])
  const [loanGrowthData, setLoanGrowthData] = useState<any[]>([])
  const [revenueTrendData, setRevenueTrendData] = useState<any[]>([])
  const [memberGrowthData, setMemberGrowthData] = useState<any[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch("/api/admin/stats")
      if (!res.ok) throw new Error()
      const data = await res.json()
      const { stats, recentMembers: rm, recentLoanRequests, recentPayments: rp, recentActivity, savingsGrowth, monthlyData } = data

      const mCount = stats?.memberCount || 0
      const aLoans = stats?.activeLoans || 0
      const tSavings = stats?.totalSavings || 0
      const tPayments = stats?.totalPayments || 0
      const tDeposits = stats?.totalDeposits || 0
      const pLoans = stats?.pendingLoans || 0

      const mk = (total: number) => { const s = makeSparkline(total); return { ...computeTrend(s), sparkline: s } }

      setStatCardsConfig([
        { label: "Total Members", value: mCount, icon: Users, gradient: "from-[#0B3C5D] to-[#0B3C5D]/70", ...mk(mCount) },
        { label: "Active Loans", value: aLoans, icon: HandCoins, gradient: "from-emerald-500 to-emerald-600", ...mk(aLoans) },
        { label: "Total Savings", value: tSavings, icon: PiggyBank, gradient: "from-amber-400 to-amber-500", ...mk(tSavings) },
        { label: "Loan Recovery", value: 97.2, icon: ShieldCheck, gradient: "from-cyan-500 to-cyan-600", ...(() => { const s = makeSparkline(9720, 7); return { ...computeTrend(s), sparkline: s } })() },
        { label: "Total Payments", value: tPayments, icon: DollarSign, gradient: "from-green-500 to-green-600", ...mk(tPayments) },
        { label: "Total Deposits", value: tDeposits, icon: ArrowUpCircle, gradient: "from-violet-500 to-violet-600", ...mk(tDeposits) },
        { label: "Pending Apps", value: pLoans, icon: FileText, gradient: "from-orange-500 to-orange-600", ...mk(pLoans) },
        { label: "System Health", value: 98, trend: 0.5, trendUp: true, sparkline: [{ v: 99 }, { v: 98.5 }, { v: 98 }, { v: 98.5 }, { v: 99 }, { v: 98.5 }, { v: 98 }], icon: Activity, gradient: "from-rose-500 to-rose-600" },
      ])

      setLoanRequests((recentLoanRequests || []).map((lr: any) => ({
        id: lr.id,
        member: [lr.firstName, lr.lastName].filter(Boolean).join(" ") || `Request #${lr.id}`,
        amount: lr.amount || 0,
        purpose: lr.productName || "Loan",
        status: lr.status || "pending",
        date: lr.appliedAt ? timeAgo(lr.appliedAt) : "",
      })))

      setRecentPayments((rp || []).map((p: any) => ({
        id: p.id,
        member: [p.firstName, p.lastName].filter(Boolean).join(" ") || `Payment #${p.id}`,
        amount: p.amount || 0,
        method: p.method || "—",
        status: p.status || "success",
        date: p.paidAt ? timeAgo(p.paidAt) : "",
      })))

      setRecentMembers((rm || []).map((m: any, i: number) => ({
        id: `M-${String(i + 1).padStart(3, "0")}`,
        name: [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email || `Member #${m.id}`,
        joinDate: m.createdAt ? timeAgo(m.createdAt) : "",
        status: "active",
        savings: 0,
      })))

      setActivityFeed((recentActivity || []).map((a: any, i: number) => {
        const meta = getActivityMeta(a.action || "")
        return { id: i + 1, icon: meta.icon, desc: a.action || "Activity", time: a.createdAt ? timeAgo(a.createdAt) : "", color: meta.color, bg: meta.bg }
      }))

      if (Array.isArray(savingsGrowth) && savingsGrowth.length > 0) {
        const sorted = [...savingsGrowth].sort((a: any, b: any) => parseInt(a.month) - parseInt(b.month))
        setMonthlySavingsData(sorted.map((d: any) => ({ month: MONTH_NAMES[parseInt(d.month) - 1] || d.month, value: d.value })))
      } else {
        setMonthlySavingsData([])
      }

      if (Array.isArray(monthlyData) && monthlyData.length > 0) {
        const sorted = [...monthlyData].sort((a: any, b: any) => parseInt(a.month) - parseInt(b.month))
        setLoanGrowthData(sorted.map((d: any) => ({ month: MONTH_NAMES[parseInt(d.month) - 1] || d.month, value: d.loans || 0 })))
        setRevenueTrendData(sorted.map((d: any) => ({ month: MONTH_NAMES[parseInt(d.month) - 1] || d.month, value: d.income || 0 })))
      } else {
        setLoanGrowthData([])
        setRevenueTrendData([])
      }

      setMemberGrowthData(Array.from({ length: 12 }, (_, i) => ({
        month: MONTH_NAMES[i],
        value: Math.round(mCount * (0.35 + (i / 11) * 0.65)),
      })))

      setLoading(false)
    } catch {
      setError(true)
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRefresh = () => { fetchData() }

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 px-6 py-6 text-center max-w-xs">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Failed to load</h2>
          <p className="text-xs text-red-500 dark:text-red-400/80 mb-3">Could not fetch dashboard data.</p>
          <button onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 active:scale-95 transition-all">
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 lg:space-y-6 pb-4 lg:pb-6">

      {/* ── Header ── */}
      <motion.div variants={cardVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">IAS admin overview</p>
        </div>
        <button onClick={handleRefresh}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B3C5D] text-white hover:bg-[#0B3C5D]/90 active:scale-95 transition-all">
          <RefreshCw className="h-4 w-4" />
        </button>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div variants={cardVariants}>
        <div className="hidden lg:flex items-center gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.label} href={action.href}
                className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all shadow-xs">
                <div className={cn("flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br", action.gradient, "text-white")}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                {action.label}
              </Link>
            )
          })}
        </div>
        <div className="grid grid-cols-4 gap-2 lg:hidden">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.label} href={action.href}
                className="flex flex-col items-center gap-1 rounded-xl bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 p-2.5 active:scale-95 transition-all">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br", action.gradient, "text-white shadow-xs")}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-semibold text-gray-700 dark:text-gray-300 text-center leading-tight">{action.label}</span>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <motion.div variants={cardVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {statCardsConfig.map((card, i) => (
            <StatCard key={card.label} card={card} index={i} />
          ))}
        </div>
      </motion.div>

      {/* ── Financial Charts ── */}
      <motion.div variants={cardVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/80 dark:bg-gray-900/80 p-4 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Savings Trend</h3>
              <div className="flex gap-1">
                {["7D", "30D", "1Y"].map((opt) => (
                  <button key={opt} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{opt}</button>
                ))}
              </div>
            </div>
            <div className="h-36 lg:h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySavingsData}>
                  <defs><linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0B3C5D" stopOpacity={0.25} /><stop offset="100%" stopColor="#0B3C5D" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-gray-100 dark:stroke-gray-800" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} className="text-gray-400" />
                  <YAxis tick={{ fontSize: 10 }} className="text-gray-400" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#0B3C5D" strokeWidth={2} fill="url(#sGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl bg-white/80 dark:bg-gray-900/80 p-4 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Loan Growth</h3>
              <div className="flex gap-1">
                {["7D", "30D", "1Y"].map((opt) => (
                  <button key={opt} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{opt}</button>
                ))}
              </div>
            </div>
            <div className="h-36 lg:h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loanGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-gray-100 dark:stroke-gray-800" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} className="text-gray-400" />
                  <YAxis tick={{ fontSize: 10 }} className="text-gray-400" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Recent Sections (Desktop: 2x2 grid, Mobile: stacked) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

        {/* Recent Loan Requests */}
        <motion.div variants={cardVariants} className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <HandCoins className="h-3.5 w-3.5 text-[#0B3C5D]" />
              Loan Requests
            </h3>
            <Link href="/admin/loans" className="text-[10px] text-[#0B3C5D] font-medium flex items-center gap-0.5 hover:underline">
              All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {loanRequests.map((lr) => (
              <div key={lr.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{lr.member}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{lr.purpose} · {lr.date}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">{formatCurrency(lr.amount)}</span>
                  <StatusBadge status={lr.status} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Payments */}
        <motion.div variants={cardVariants} className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
              Recent Payments
            </h3>
            <Link href="/admin/payments" className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 hover:underline">
              All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{p.member}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{p.method} · {p.date}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">{formatCurrency(p.amount)}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Members */}
        <motion.div variants={cardVariants} className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-violet-500" />
              New Members
            </h3>
            <Link href="/admin/members" className="text-[10px] text-violet-600 font-medium flex items-center gap-0.5 hover:underline">
              All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentMembers.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{m.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Joined {m.joinDate}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">{formatCurrency(m.savings)}</span>
                  <StatusBadge status={m.status} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={cardVariants} className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-[#16A34A]" />
              Recent Activity
            </h3>
            <button className="text-[10px] text-[#16A34A] font-medium flex items-center gap-0.5">
              All <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {activityFeed.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className={cn("flex h-6 w-6 items-center justify-center rounded-md shrink-0", item.bg)}>
                    <Icon className={cn("h-3 w-3", item.color)} />
                  </div>
                  <p className="flex-1 text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{item.desc}</p>
                  <span className="text-[10px] text-gray-400 shrink-0">{item.time}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

      </div>

      {/* ── AI Insights (hidden on mobile to save space) ── */}
      <motion.div variants={cardVariants} className="hidden lg:block">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-3">Insights</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: ShieldCheck, title: "Loan Repayment Risk", desc: "Default rates remain below 2.3%. Portfolio at low risk.", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", badge: "Low Risk", badgeCls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
            { icon: TrendingUp, title: "Savings Growth", desc: "Member savings increased by 12% this month.", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", badge: "+12%", badgeCls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
            { icon: Activity, title: "Kigali Branch Activity", desc: "Highest transaction volume this quarter.", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", badge: "Active", badgeCls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
            { icon: Bell, title: "Pending Follow-ups", desc: "5 members with overdue contributions.", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", badge: "5 Pending", badgeCls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
          ].map((insight) => {
            const Icon = insight.icon
            return (
              <div key={insight.title} className="rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn("flex h-6 w-6 items-center justify-center rounded-md", insight.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", insight.color)} />
                  </div>
                  <span className={cn("px-1.5 py-0.5 text-[9px] font-semibold rounded-full", insight.badgeCls)}>{insight.badge}</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">{insight.desc}</p>
              </div>
            )
          })}
        </div>
      </motion.div>

    </motion.div>
  )
}
