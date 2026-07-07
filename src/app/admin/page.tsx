"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Users, HandCoins, PiggyBank, ArrowUpCircle, Activity, DollarSign,
  FileText, ShieldCheck, RefreshCw, TrendingUp, UserPlus, FileDown,
  CheckCircle, Bell, Database, Server, HardDrive, Wifi,
  ChevronRight, Clock, AlertTriangle, ChevronUp,
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { cn, formatCurrency } from "@/lib/utils"

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

const insights = [
  { icon: ShieldCheck, title: "Loan Repayment Risk", description: "Default rates remain below 2.3%. Portfolio at low risk.", color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-900/20", badge: "Low Risk", badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { icon: TrendingUp, title: "Savings Growth", description: "Member savings increased by 12% this month.", color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-900/20", badge: "+12%", badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { icon: Activity, title: "Kigali Branch Activity", description: "Highest transaction volume this quarter.", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20", badge: "Active", badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  { icon: Bell, title: "Pending Follow-ups", description: "5 members with overdue contributions.", color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-900/20", badge: "5 Pending", badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
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

const filterOptions = ["7D", "30D", "90D", "1Y"]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
}

function useAnimatedCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    if (ref.current) cancelAnimationFrame(ref.current)
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(0 + (target - 0) * eased))
      if (progress < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [target, duration])

  return value
}

function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl bg-white dark:bg-gray-900 p-3 border border-gray-100 dark:border-gray-800">
            <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="mt-2 h-5 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="mt-1 h-3 w-12 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ card, index }: { card: typeof statCardsConfig[0]; index: number }) {
  const Icon = card.icon
  const count = useAnimatedCounter(card.value)
  const displayValue = card.label === "Total Savings" || card.label === "Monthly Revenue" || card.label === "Contributions"
    ? formatCurrency(count)
    : card.label === "Loan Recovery" || card.label === "System Health"
      ? `${count}%`
      : count.toLocaleString()

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-3 border border-gray-100 dark:border-gray-800 active:scale-[0.97] transition-transform"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br", card.gradient, "text-white shadow-xs")}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className={cn("text-[10px] font-semibold", card.trendUp ? "text-green-500" : "text-red-500")}>
          <TrendingUp className={cn("h-3 w-3 inline mr-0.5", !card.trendUp && "rotate-180")} />
          {card.trendUp ? "+" : ""}{card.trend}%
        </span>
      </div>
      <p className="text-sm font-bold text-gray-900 dark:text-white">{displayValue}</p>
      <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
    </motion.div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={cardVariants} className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-3 border border-gray-100 dark:border-gray-800">
      <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg px-2 py-1.5 text-[10px]">
        <p className="font-medium text-gray-900 dark:text-white mb-0.5">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">{formatCurrency(p.value)}</p>
        ))}
      </div>
    )
  }
  return null
}

function NumericTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg px-2 py-1.5 text-[10px]">
        <p className="font-medium text-gray-900 dark:text-white mb-0.5">{label}</p>
        {payload.map((p, i) => (<p key={i} style={{ color: p.color }} className="font-semibold">{p.value.toLocaleString()}</p>))}
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expandedChart, setExpandedChart] = useState<string | null>(null)

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

  const chartSections = useMemo(() => [
    { id: "savings", title: "Savings Trend", data: monthlySavingsData, type: "area" as const, color: "#0B3C5D", gradient: "savingsGrad" },
    { id: "loans", title: "Loan Growth", data: loanGrowthData, type: "bar" as const, color: "#16A34A", gradient: "" },
    { id: "revenue", title: "Revenue", data: revenueTrendData, type: "line" as const, color: "#F4B400", gradient: "" },
    { id: "members", title: "Members", data: memberGrowthData, type: "area" as const, color: "#0B3C5D", gradient: "memberGrad" },
  ], [])

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 px-5 py-6 text-center max-w-xs mx-auto">
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3 pb-2">
      {/* Header */}
      <motion.div variants={cardVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">IAS admin overview</p>
        </div>
        <button onClick={handleRefresh}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B3C5D] text-white hover:bg-[#0B3C5D]/90 active:scale-95 transition-all">
          <RefreshCw className="h-4 w-4" />
        </button>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={cardVariants} className="grid grid-cols-4 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.label} href={action.href}
              className="flex flex-col items-center gap-1 rounded-xl bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 p-2.5 transition-all active:scale-95">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br", action.gradient, "text-white shadow-xs")}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-semibold text-gray-700 dark:text-gray-300 text-center leading-tight">{action.label}</span>
            </Link>
          )
        })}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2">
        {statCardsConfig.map((card, i) => (
          <StatCard key={card.label} card={card} index={i} />
        ))}
      </div>

      {/* Financial Charts */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2">
          {expandedChart ? (
            <>
              <motion.div variants={cardVariants} className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-3 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                    {chartSections.find(c => c.id === expandedChart)?.title}
                  </h3>
                  <button onClick={() => setExpandedChart(null)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartSections.find(c => c.id === expandedChart)?.type === "area" ? (
                      <AreaChart data={chartSections.find(c => c.id === expandedChart)?.data}>
                        <defs>
                          <linearGradient id={`exp-${expandedChart}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0B3C5D" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#0B3C5D" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-gray-100 dark:stroke-gray-800" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} className="text-gray-400" />
                        <YAxis tick={{ fontSize: 10 }} className="text-gray-400" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="value" stroke="#0B3C5D" strokeWidth={2} fill={`url(#exp-${expandedChart})`} />
                      </AreaChart>
                    ) : chartSections.find(c => c.id === expandedChart)?.type === "bar" ? (
                      <BarChart data={chartSections.find(c => c.id === expandedChart)?.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-gray-100 dark:stroke-gray-800" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} className="text-gray-400" />
                        <YAxis tick={{ fontSize: 10 }} className="text-gray-400" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="value" fill="#16A34A" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <LineChart data={chartSections.find(c => c.id === expandedChart)?.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-gray-100 dark:stroke-gray-800" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} className="text-gray-400" />
                        <YAxis tick={{ fontSize: 10 }} className="text-gray-400" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                        <Tooltip content={<ChartTooltip />} />
                        <Line type="monotone" dataKey="value" stroke="#F4B400" strokeWidth={2.5} dot={{ r: 3, fill: "#F4B400" }} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </motion.div>
              {chartSections.filter(c => c.id !== expandedChart).slice(0, 2).map(ch => (
                <ChartCard key={ch.id} title={ch.title}>
                  {ch.type === "area" ? (
                    <AreaChart data={ch.data}>
                      <defs><linearGradient id={`m-${ch.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={ch.color} stopOpacity={0.2} /><stop offset="100%" stopColor={ch.color} stopOpacity={0} /></linearGradient></defs>
                      <Area type="monotone" dataKey="value" stroke={ch.color} strokeWidth={1.5} fill={`url(#m-${ch.id})`} dot={false} />
                    </AreaChart>
                  ) : ch.type === "bar" ? (
                    <BarChart data={ch.data}><Bar dataKey="value" fill={ch.color} radius={[2, 2, 0, 0]} /></BarChart>
                  ) : (
                    <LineChart data={ch.data}><Line type="monotone" dataKey="value" stroke={ch.color} strokeWidth={1.5} dot={false} /></LineChart>
                  )}
                </ChartCard>
              ))}
            </>
          ) : (
            chartSections.map(ch => (
              <ChartCard key={ch.id} title={ch.title}>
                <div className="relative w-full h-full" onClick={() => setExpandedChart(ch.id)}>
                  {ch.type === "area" ? (
                    <AreaChart data={ch.data}>
                      <defs><linearGradient id={`mc-${ch.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={ch.color} stopOpacity={0.2} /><stop offset="100%" stopColor={ch.color} stopOpacity={0} /></linearGradient></defs>
                      <Area type="monotone" dataKey="value" stroke={ch.color} strokeWidth={1.5} fill={`url(#mc-${ch.id})`} dot={false} />
                    </AreaChart>
                  ) : ch.type === "bar" ? (
                    <BarChart data={ch.data}><Bar dataKey="value" fill={ch.color} radius={[2, 2, 0, 0]} /></BarChart>
                  ) : (
                    <LineChart data={ch.data}><Line type="monotone" dataKey="value" stroke={ch.color} strokeWidth={1.5} dot={false} /></LineChart>
                  )}
                </div>
              </ChartCard>
            ))
          )}
        </div>
      </div>

      {/* AI Insights */}
      <motion.div variants={cardVariants}>
        <h2 className="text-xs font-bold text-gray-900 dark:text-white mb-2">Insights</h2>
        <div className="grid grid-cols-2 gap-2">
          {insights.map((insight) => {
            const Icon = insight.icon
            return (
              <motion.div key={insight.title} variants={cardVariants}
                className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-2.5 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={cn("flex h-5 w-5 items-center justify-center rounded-md", insight.bgColor)}>
                    <Icon className={cn("h-3 w-3", insight.color)} />
                  </div>
                  <span className={cn("px-1 py-0.5 text-[8px] font-semibold rounded-full", insight.badgeColor)}>{insight.badge}</span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{insight.description}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Activity Feed */}
      <motion.div variants={cardVariants}
        className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-3 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-[#16A34A]" />
            Recent Activity
          </h2>
          <button className="text-[10px] text-[#16A34A] font-medium flex items-center gap-0.5">
            All <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-0">
          {activityFeed.slice(0, 5).map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-2 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div className={cn("flex h-6 w-6 items-center justify-center rounded-md flex-shrink-0", item.bg)}>
                  <Icon className={cn("h-3 w-3", item.color)} />
                </div>
                <p className="flex-1 text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate">{item.desc}</p>
                <span className="text-[9px] text-gray-400 flex items-center gap-0.5 flex-shrink-0">
                  <Clock className="h-2.5 w-2.5" />
                  {item.time}
                </span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
