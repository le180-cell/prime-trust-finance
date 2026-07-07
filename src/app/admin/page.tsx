"use client"

import { useState, useEffect, useRef } from "react"
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

/* ─── Data ─── */

const monthlySavingsData = [
  { month: "Jan", value: 45000000 }, { month: "Feb", value: 52000000 },
  { month: "Mar", value: 48000000 }, { month: "Apr", value: 61000000 },
  { month: "May", value: 58000000 }, { month: "Jun", value: 72000000 },
  { month: "Jul", value: 68000000 }, { month: "Aug", value: 81000000 },
  { month: "Sep", value: 76000000 }, { month: "Oct", value: 89000000 },
  { month: "Nov", value: 94000000 }, { month: "Dec", value: 102000000 },
]

const loanGrowthData = [
  { month: "Jan", value: 12000000 }, { month: "Feb", value: 15000000 },
  { month: "Mar", value: 13500000 }, { month: "Apr", value: 18000000 },
  { month: "May", value: 20000000 }, { month: "Jun", value: 24000000 },
  { month: "Jul", value: 22000000 }, { month: "Aug", value: 28000000 },
  { month: "Sep", value: 26000000 }, { month: "Oct", value: 31000000 },
  { month: "Nov", value: 35000000 }, { month: "Dec", value: 38000000 },
]

const revenueTrendData = [
  { month: "Jan", value: 8500000 }, { month: "Feb", value: 9200000 },
  { month: "Mar", value: 8800000 }, { month: "Apr", value: 10500000 },
  { month: "May", value: 11200000 }, { month: "Jun", value: 12800000 },
  { month: "Jul", value: 11900000 }, { month: "Aug", value: 13500000 },
  { month: "Sep", value: 14100000 }, { month: "Oct", value: 15800000 },
  { month: "Nov", value: 16200000 }, { month: "Dec", value: 17500000 },
]

const memberGrowthData = [
  { month: "Jan", value: 1200 }, { month: "Feb", value: 1350 },
  { month: "Mar", value: 1480 }, { month: "Apr", value: 1620 },
  { month: "May", value: 1790 }, { month: "Jun", value: 1950 },
  { month: "Jul", value: 2100 }, { month: "Aug", value: 2280 },
  { month: "Sep", value: 2450 }, { month: "Oct", value: 2670 },
  { month: "Nov", value: 2890 }, { month: "Dec", value: 3100 },
]

const quickActions = [
  { label: "Add Member", icon: UserPlus, href: "/admin/members", gradient: "from-[#0B3C5D] to-blue-600" },
  { label: "New Loan", icon: HandCoins, href: "/admin/loans", gradient: "from-emerald-500 to-emerald-600" },
  { label: "Reports", icon: FileText, href: "/admin/reports", gradient: "from-amber-400 to-amber-500" },
  { label: "Analytics", icon: TrendingUp, href: "/admin/reports", gradient: "from-violet-500 to-violet-600" },
]

const statCardsConfig = [
  { label: "Total Members", value: 5842, trend: 12.5, trendUp: true, sparkline: [{ v: 4800 }, { v: 5100 }, { v: 4950 }, { v: 5300 }, { v: 5550 }, { v: 5700 }, { v: 5842 }], icon: Users, gradient: "from-[#0B3C5D] to-[#0B3C5D]/70" },
  { label: "Active Loans", value: 1247, trend: 8.3, trendUp: true, sparkline: [{ v: 980 }, { v: 1050 }, { v: 1120 }, { v: 1080 }, { v: 1180 }, { v: 1210 }, { v: 1247 }], icon: HandCoins, gradient: "from-emerald-500 to-emerald-600" },
  { label: "Total Savings", value: 102000000, trend: 15.2, trendUp: true, sparkline: [{ v: 72000000 }, { v: 78000000 }, { v: 81000000 }, { v: 86000000 }, { v: 92000000 }, { v: 97000000 }, { v: 102000000 }], icon: PiggyBank, gradient: "from-amber-400 to-amber-500" },
  { label: "Loan Recovery", value: 97.2, trend: 2.1, trendUp: true, sparkline: [{ v: 94 }, { v: 95 }, { v: 95.5 }, { v: 96 }, { v: 96.5 }, { v: 97 }, { v: 97.2 }], icon: ShieldCheck, gradient: "from-cyan-500 to-cyan-600" },
  { label: "Monthly Revenue", value: 17500000, trend: 8.2, trendUp: true, sparkline: [{ v: 12500000 }, { v: 13200000 }, { v: 14100000 }, { v: 15000000 }, { v: 15800000 }, { v: 16800000 }, { v: 17500000 }], icon: DollarSign, gradient: "from-green-500 to-green-600" },
  { label: "Contributions", value: 45600000, trend: 10.8, trendUp: true, sparkline: [{ v: 32000000 }, { v: 35000000 }, { v: 37000000 }, { v: 39000000 }, { v: 42000000 }, { v: 44000000 }, { v: 45600000 }], icon: ArrowUpCircle, gradient: "from-violet-500 to-violet-600" },
  { label: "Pending Apps", value: 83, trend: 5.7, trendUp: false, sparkline: [{ v: 45 }, { v: 52 }, { v: 61 }, { v: 58 }, { v: 70 }, { v: 78 }, { v: 83 }], icon: FileText, gradient: "from-orange-500 to-orange-600" },
  { label: "System Health", value: 98, trend: 0.5, trendUp: true, sparkline: [{ v: 99 }, { v: 98.5 }, { v: 98 }, { v: 98.5 }, { v: 99 }, { v: 98.5 }, { v: 98 }], icon: Activity, gradient: "from-rose-500 to-rose-600" },
]

const loanRequests = [
  { id: "LR-001", member: "Jean Pierre", amount: 500000, purpose: "Agriculture", status: "pending", date: "2h ago" },
  { id: "LR-002", member: "Alice Uwimana", amount: 1200000, purpose: "Education", status: "approved", date: "4h ago" },
  { id: "LR-003", member: "Patrick Mugisha", amount: 300000, purpose: "Emergency", status: "pending", date: "6h ago" },
  { id: "LR-004", member: "Diane Ingabire", amount: 800000, purpose: "Development", status: "rejected", date: "1d ago" },
  { id: "LR-005", member: "Emmanuel Habimana", amount: 2000000, purpose: "Agriculture", status: "pending", date: "1d ago" },
]

const recentPayments = [
  { id: "PAY-001", member: "Jean Pierre", amount: 25000, method: "Mobile Money", status: "success", date: "2h ago" },
  { id: "PAY-002", member: "Alice Uwimana", amount: 45000, method: "Bank Transfer", status: "success", date: "4h ago" },
  { id: "PAY-003", member: "Patrick Mugisha", amount: 15000, method: "Cash Deposit", status: "pending", date: "6h ago" },
  { id: "PAY-004", member: "Diane Ingabire", amount: 30000, method: "Mobile Money", status: "success", date: "1d ago" },
  { id: "PAY-005", member: "Grace Uwase", amount: 20000, method: "Bank Transfer", status: "failed", date: "1d ago" },
]

const recentMembers = [
  { id: "M-001", name: "Olivier Niyonzima", joinDate: "Jan 15", status: "active", savings: 50000 },
  { id: "M-002", name: "Grace Uwase", joinDate: "Jan 14", status: "active", savings: 25000 },
  { id: "M-003", name: "David Mugabo", joinDate: "Jan 13", status: "pending", savings: 0 },
  { id: "M-004", name: "Sarah Uwimana", joinDate: "Jan 12", status: "active", savings: 75000 },
  { id: "M-005", name: "Michael Habimana", joinDate: "Jan 11", status: "active", savings: 100000 },
]

const activityFeed = [
  { id: 1, icon: UserPlus, desc: "New member registered", time: "2m ago", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { id: 2, icon: HandCoins, desc: "Loan #1024 approved", time: "15m ago", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { id: 3, icon: ArrowUpCircle, desc: "Contribution received", time: "32m ago", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20" },
  { id: 4, icon: CheckCircle, desc: "Payment completed", time: "1h ago", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
  { id: 5, icon: FileDown, desc: "Statement downloaded", time: "2h ago", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  { id: 6, icon: UserPlus, desc: "New member registered", time: "3h ago", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
]

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

function StatCard({ card, index }: { card: typeof statCardsConfig[0]; index: number }) {
  const Icon = card.icon
  const count = useAnimatedCounter(card.value)
  const displayValue = ["Total Savings", "Monthly Revenue", "Contributions"].includes(card.label)
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

  useEffect(() => {
    let cancelled = false
    fetch("/api/admin/stats")
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then(() => { if (!cancelled) setLoading(false) })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  const handleRefresh = () => {
    setLoading(true); setError(false)
    fetch("/api/admin/stats")
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then(() => setLoading(false))
      .catch(() => { setError(true); setLoading(false) })
  }

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
