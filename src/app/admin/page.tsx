"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Users, HandCoins, PiggyBank, ArrowUpCircle, Activity, DollarSign,
  FileText, ShieldCheck, RefreshCw, TrendingUp, UserPlus, FileDown,
  CheckCircle, Bell, Database, Server, HardDrive, Wifi,
  ChevronRight, Clock, AlertTriangle,
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { cn, formatCurrency } from "@/lib/utils"

// --- Mock Data ---

const monthlySavingsData = [
  { month: "Jan", value: 45000000 },
  { month: "Feb", value: 52000000 },
  { month: "Mar", value: 48000000 },
  { month: "Apr", value: 61000000 },
  { month: "May", value: 58000000 },
  { month: "Jun", value: 72000000 },
  { month: "Jul", value: 68000000 },
  { month: "Aug", value: 81000000 },
  { month: "Sep", value: 76000000 },
  { month: "Oct", value: 89000000 },
  { month: "Nov", value: 94000000 },
  { month: "Dec", value: 102000000 },
]

const loanGrowthData = [
  { month: "Jan", value: 12000000 },
  { month: "Feb", value: 15000000 },
  { month: "Mar", value: 13500000 },
  { month: "Apr", value: 18000000 },
  { month: "May", value: 20000000 },
  { month: "Jun", value: 24000000 },
  { month: "Jul", value: 22000000 },
  { month: "Aug", value: 28000000 },
  { month: "Sep", value: 26000000 },
  { month: "Oct", value: 31000000 },
  { month: "Nov", value: 35000000 },
  { month: "Dec", value: 38000000 },
]

const revenueTrendData = [
  { month: "Jan", value: 8500000 },
  { month: "Feb", value: 9200000 },
  { month: "Mar", value: 8800000 },
  { month: "Apr", value: 10500000 },
  { month: "May", value: 11200000 },
  { month: "Jun", value: 12800000 },
  { month: "Jul", value: 11900000 },
  { month: "Aug", value: 13500000 },
  { month: "Sep", value: 14100000 },
  { month: "Oct", value: 15800000 },
  { month: "Nov", value: 16200000 },
  { month: "Dec", value: 17500000 },
]

const memberGrowthData = [
  { month: "Jan", value: 1200 },
  { month: "Feb", value: 1350 },
  { month: "Mar", value: 1480 },
  { month: "Apr", value: 1620 },
  { month: "May", value: 1790 },
  { month: "Jun", value: 1950 },
  { month: "Jul", value: 2100 },
  { month: "Aug", value: 2280 },
  { month: "Sep", value: 2450 },
  { month: "Oct", value: 2670 },
  { month: "Nov", value: 2890 },
  { month: "Dec", value: 3100 },
]

const insights = [
  {
    icon: ShieldCheck,
    title: "Loan Repayment Risk",
    description: "Default rates remain below 2.3%. Portfolio at low risk.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    badge: "Low Risk",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    icon: TrendingUp,
    title: "Savings Growth",
    description: "Member savings increased by 12% this month, driven by new contribution plans.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    badge: "+12%",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    icon: Activity,
    title: "Kigali Branch Activity",
    description: "Kigali branch records highest transaction volume this quarter.",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    badge: "Active",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    icon: Bell,
    title: "Pending Follow-ups",
    description: "5 members with overdue contributions require follow-up today.",
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    badge: "5 Pending",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
]

const activityFeed = [
  { id: 1, icon: UserPlus, desc: "New member registered", time: "2m ago", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { id: 2, icon: HandCoins, desc: "Loan #1024 approved", time: "15m ago", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { id: 3, icon: ArrowUpCircle, desc: "Contribution received", time: "32m ago", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20" },
  { id: 4, icon: CheckCircle, desc: "Payment completed", time: "1h ago", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
  { id: 5, icon: FileDown, desc: "Statement downloaded", time: "2h ago", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  { id: 6, icon: UserPlus, desc: "New member registered", time: "3h ago", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { id: 7, icon: HandCoins, desc: "Loan #1023 disbursed", time: "4h ago", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { id: 8, icon: CheckCircle, desc: "Payment completed", time: "5h ago", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
]

const quickActions = [
  { label: "Add Member", icon: UserPlus, color: "bg-[#0B3C5D] hover:bg-[#0B3C5D]/90", href: "/admin/members" },
  { label: "New Loan", icon: HandCoins, color: "bg-[#16A34A] hover:bg-[#16A34A]/90", href: "/admin/loans" },
  { label: "Generate Report", icon: FileText, color: "bg-[#F4B400] hover:bg-[#F4B400]/90", href: "/admin/reports" },
  { label: "View Analytics", icon: TrendingUp, color: "bg-[#0B3C5D] hover:bg-[#0B3C5D]/90", href: "/admin/reports" },
]

const statCardsConfig = [
  {
    label: "Total Members", value: 5842, trend: 12.5, trendUp: true,
    sparkline: [{ v: 4800 }, { v: 5100 }, { v: 4950 }, { v: 5300 }, { v: 5550 }, { v: 5700 }, { v: 5842 }],
    icon: Users, gradient: "from-[#0B3C5D] to-[#0B3C5D]/70",
  },
  {
    label: "Active Loans", value: 1247, trend: 8.3, trendUp: true,
    sparkline: [{ v: 980 }, { v: 1050 }, { v: 1120 }, { v: 1080 }, { v: 1180 }, { v: 1210 }, { v: 1247 }],
    icon: HandCoins, gradient: "from-emerald-500 to-emerald-600",
  },
  {
    label: "Total Savings", value: 102000000, trend: 15.2, trendUp: true,
    sparkline: [{ v: 72000000 }, { v: 78000000 }, { v: 81000000 }, { v: 86000000 }, { v: 92000000 }, { v: 97000000 }, { v: 102000000 }],
    icon: PiggyBank, gradient: "from-amber-400 to-amber-500",
  },
  {
    label: "Total Contributions", value: 45600000, trend: 10.8, trendUp: true,
    sparkline: [{ v: 32000000 }, { v: 35000000 }, { v: 37000000 }, { v: 39000000 }, { v: 42000000 }, { v: 44000000 }, { v: 45600000 }],
    icon: ArrowUpCircle, gradient: "from-violet-500 to-violet-600",
  },
  {
    label: "Loan Recovery Rate", value: 97.2, trend: 2.1, trendUp: true,
    sparkline: [{ v: 94 }, { v: 95 }, { v: 95.5 }, { v: 96 }, { v: 96.5 }, { v: 97 }, { v: 97.2 }],
    icon: ShieldCheck, gradient: "from-cyan-500 to-cyan-600",
  },
  {
    label: "Monthly Revenue", value: 17500000, trend: 8.2, trendUp: true,
    sparkline: [{ v: 12500000 }, { v: 13200000 }, { v: 14100000 }, { v: 15000000 }, { v: 15800000 }, { v: 16800000 }, { v: 17500000 }],
    icon: DollarSign, gradient: "from-green-500 to-green-600",
  },
  {
    label: "Pending Applications", value: 83, trend: 5.7, trendUp: false,
    sparkline: [{ v: 45 }, { v: 52 }, { v: 61 }, { v: 58 }, { v: 70 }, { v: 78 }, { v: 83 }],
    icon: FileText, gradient: "from-orange-500 to-orange-600",
  },
  {
    label: "System Health", value: 98, trend: 0.5, trendUp: true,
    sparkline: [{ v: 99 }, { v: 98.5 }, { v: 98 }, { v: 98.5 }, { v: 99 }, { v: 98.5 }, { v: 98 }],
    icon: Activity, gradient: "from-rose-500 to-rose-600",
  },
]

const filterOptions = ["7D", "30D", "90D", "1Y"]

// --- Animation Helpers ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
}

const insightsContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const insightItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// --- Animated Counter Hook ---

function useAnimatedCounter(target: number, duration = 1500) {
  const [value, setValue] = useState(0)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    if (ref.current) cancelAnimationFrame(ref.current)
    const start = performance.now()
    const initial = 0

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(initial + (target - initial) * eased))
      if (progress < 1) {
        ref.current = requestAnimationFrame(tick)
      }
    }

    ref.current = requestAnimationFrame(tick)
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current)
    }
  }, [target, duration])

  return value
}

// --- Skeleton ---

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-72 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="h-5 w-96 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="admin-card rounded-2xl bg-white dark:bg-gray-900 p-5 border border-gray-100 dark:border-gray-800">
            <div className="h-11 w-11 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="mt-4 h-7 w-24 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="mt-1 h-4 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="admin-card rounded-2xl bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800">
            <div className="h-6 w-40 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse mb-5" />
            <div className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Sub-components ---

function StatCard({ card, index }: { card: typeof statCardsConfig[0]; index: number }) {
  const Icon = card.icon
  const count = useAnimatedCounter(card.value)
  const displayValue = card.label === "Total Savings" || card.label === "Total Contributions" || card.label === "Monthly Revenue"
    ? formatCurrency(count)
    : card.label === "Loan Recovery Rate" || card.label === "System Health"
      ? `${count}%`
      : count.toLocaleString()

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)" }}
      className="admin-card group rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 border border-gray-100 dark:border-gray-800 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br", card.gradient, "text-white shadow-sm")}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="h-10 w-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={card.sparkline}>
              <defs>
                <linearGradient id={`sparkGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={card.trendUp ? "#16A34A" : "#EF4444"} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={card.trendUp ? "#16A34A" : "#EF4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={card.trendUp ? "#16A34A" : "#EF4444"} strokeWidth={1.5} fill={`url(#sparkGrad-${index})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="mt-4 font-heading text-2xl font-bold text-gray-900 dark:text-white">{displayValue}</p>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
      <div className="mt-1 flex items-center gap-1.5">
        {card.trendUp
          ? <TrendingUp className="h-3.5 w-3.5 text-green-500" />
          : <TrendingUp className="h-3.5 w-3.5 text-red-500 rotate-180" />
        }
        <span className={cn("text-xs font-semibold", card.trendUp ? "text-green-500" : "text-red-500")}>
          {card.trendUp ? "+" : ""}{card.trend}%
        </span>
        <span className="text-xs text-gray-400">vs last month</span>
      </div>
    </motion.div>
  )
}

function ChartCard({
  title, filter, onFilterChange, children, summary,
}: {
  title: string
  filter: string
  onFilterChange: (f: string) => void
  children: React.ReactNode
  summary: string
}) {
  return (
    <motion.div variants={cardVariants} className="admin-card rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-heading text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex gap-1">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => onFilterChange(opt)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-lg transition-colors",
                filter === opt
                  ? "bg-[#0B3C5D] text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">{summary}</p>
    </motion.div>
  )
}

interface TooltipProps {
  active?: boolean
  payload?: { color: string; value: number }[]
  label?: string
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg px-3 py-2 text-xs">
        <p className="font-medium text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function NumericTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg px-3 py-2 text-xs">
        <p className="font-medium text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// --- Main Component ---

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [savingsFilter, setSavingsFilter] = useState("30D")
  const [loanFilter, setLoanFilter] = useState("30D")
  const [revenueFilter, setRevenueFilter] = useState("30D")
  const [memberFilter, setMemberFilter] = useState("30D")

  useEffect(() => {
    let cancelled = false
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load")
        return r.json()
      })
      .then(() => { if (!cancelled) setLoading(false) })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    setError(false)
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load")
        return r.json()
      })
      .then(() => setLoading(false))
      .catch(() => { setError(true); setLoading(false) })
  }

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening"

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="admin-card rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 px-8 py-6 text-center max-w-md"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-red-700 dark:text-red-400 mb-1">Failed to load dashboard</h2>
          <p className="text-sm text-red-500 dark:text-red-400/80 mb-4">Could not fetch dashboard data. Please try again.</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={cardVariants} className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {greeting}, Admin <span className="inline-block">👋</span>
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Here&apos;s what&apos;s happening with IAS today</p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0B3C5D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B3C5D]/90 transition-all active:scale-95"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={cardVariants} className="flex flex-wrap gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-95 shadow-sm",
                action.color
              )}
            >
              <Icon className="h-4 w-4" /> {action.label}
            </Link>
          )
        })}
      </motion.div>

      {/* Executive Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCardsConfig.map((card, i) => (
          <StatCard key={card.label} card={card} index={i} />
        ))}
      </div>

      {/* Financial Analytics */}
      <div>
        <motion.div variants={cardVariants}>
          <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-4">Financial Overview</h2>
        </motion.div>
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Monthly Savings Trend" filter={savingsFilter} onFilterChange={setSavingsFilter} summary="Total savings across all member accounts — steady upward trajectory">
            <AreaChart data={monthlySavingsData}>
              <defs>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B3C5D" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0B3C5D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-gray-100 dark:stroke-gray-800" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-gray-400" />
              <YAxis tick={{ fontSize: 11 }} className="text-gray-400" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#0B3C5D" strokeWidth={2} fill="url(#savingsGrad)" />
            </AreaChart>
          </ChartCard>

          <ChartCard title="Loan Growth" filter={loanFilter} onFilterChange={setLoanFilter} summary="Loan portfolio expanded by 18% year-over-year">
            <BarChart data={loanGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-gray-100 dark:stroke-gray-800" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-gray-400" />
              <YAxis tick={{ fontSize: 11 }} className="text-gray-400" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>

          <ChartCard title="Revenue Trend" filter={revenueFilter} onFilterChange={setRevenueFilter} summary="Monthly revenue from interest and fees continues to climb">
            <LineChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-gray-100 dark:stroke-gray-800" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-gray-400" />
              <YAxis tick={{ fontSize: 11 }} className="text-gray-400" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#F4B400" strokeWidth={2.5} dot={{ r: 3, fill: "#F4B400" }} />
            </LineChart>
          </ChartCard>

          <ChartCard title="Member Growth" filter={memberFilter} onFilterChange={setMemberFilter} summary="Platform reached 3,100+ active members — 158% growth this year">
            <AreaChart data={memberGrowthData}>
              <defs>
                <linearGradient id="memberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B3C5D" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0B3C5D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-gray-100 dark:stroke-gray-800" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-gray-400" />
              <YAxis tick={{ fontSize: 11 }} className="text-gray-400" />
              <Tooltip content={<NumericTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#0B3C5D" strokeWidth={2} fill="url(#memberGrad)" />
            </AreaChart>
          </ChartCard>
        </div>
      </div>

      {/* AI Insights */}
      <motion.div
        variants={insightsContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={insightItemVariants}>
          <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-4">AI Insights</h2>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {insights.map((insight) => {
            const Icon = insight.icon
            return (
              <motion.div
                key={insight.title}
                variants={insightItemVariants}
                whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.1)" }}
                className="admin-card rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 border border-gray-100 dark:border-gray-800 transition-all"
              >
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", insight.bgColor)}>
                  <Icon className={cn("h-5 w-5", insight.color)} />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <h3 className="font-heading text-sm font-semibold text-gray-900 dark:text-white">{insight.title}</h3>
                  <span className={cn("px-2 py-0.5 text-[10px] font-semibold rounded-full", insight.badgeColor)}>{insight.badge}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{insight.description}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Activity Feed + System Health */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Real-Time Activity Feed */}
        <motion.div variants={cardVariants} className="lg:col-span-2 admin-card rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#16A34A]" />
              Real-Time Activity
            </h2>
            <button className="text-sm text-[#16A34A] hover:text-[#16A34A]/80 font-medium flex items-center gap-1 transition-colors">
              View All <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-0 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            {activityFeed.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0"
                >
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0", item.bg)}>
                    <Icon className={cn("h-4 w-4", item.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.desc}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div variants={cardVariants} className="admin-card rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 border border-gray-100 dark:border-gray-800">
          <h2 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
            <ShieldCheck className="h-5 w-5 text-[#16A34A]" />
            System Health
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-500">
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <Server className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Server</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-500">
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                Running
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <HardDrive className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div className="h-full rounded-full bg-[#F4B400]" style={{ width: "45%" }} />
                </div>
                <span className="text-xs text-gray-500">45%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <Wifi className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API Health</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-500">
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                All Systems OK
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
