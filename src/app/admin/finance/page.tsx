"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Building2, PiggyBank, HandCoins, Wallet, TrendingUp, Percent,
  AlertTriangle, Receipt, CheckCircle, RefreshCw, ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { formatCurrency, cn } from "@/lib/utils"

type Range = "7D" | "30D" | "90D" | "1Y"

const ranges: Range[] = ["7D", "30D", "90D", "1Y"]

const monthlyData = [
  { month: "Jan", savings: 45, loans: 28, income: 52, cashFlow: 38, members: 120 },
  { month: "Feb", savings: 48, loans: 32, income: 49, cashFlow: 42, members: 128 },
  { month: "Mar", savings: 52, loans: 35, income: 55, cashFlow: 40, members: 135 },
  { month: "Apr", savings: 50, loans: 30, income: 58, cashFlow: 45, members: 142 },
  { month: "May", savings: 55, loans: 38, income: 53, cashFlow: 48, members: 150 },
  { month: "Jun", savings: 58, loans: 42, income: 60, cashFlow: 52, members: 158 },
  { month: "Jul", savings: 62, loans: 40, income: 62, cashFlow: 50, members: 165 },
  { month: "Aug", savings: 60, loans: 45, income: 59, cashFlow: 55, members: 172 },
  { month: "Sep", savings: 65, loans: 48, income: 64, cashFlow: 58, members: 180 },
  { month: "Oct", savings: 68, loans: 50, income: 66, cashFlow: 60, members: 188 },
  { month: "Nov", savings: 72, loans: 52, income: 70, cashFlow: 62, members: 195 },
  { month: "Dec", savings: 78, loans: 55, income: 74, cashFlow: 65, members: 205 },
]

const sparklineData = [
  { v: 10 }, { v: 15 }, { v: 12 }, { v: 18 }, { v: 14 },
  { v: 20 }, { v: 17 }, { v: 22 }, { v: 19 }, { v: 25 },
  { v: 23 }, { v: 28 },
]

interface StatCardDef {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  iconBg: string
  iconColor: string
  trend: number
  isUp: boolean
  prefix?: string
  suffix?: string
}

const statCards: StatCardDef[] = [
  { label: "Total Assets", value: 4850000000, icon: Building2, gradient: "from-blue-500/20 to-blue-600/5", iconBg: "bg-blue-500/10", iconColor: "text-blue-600", trend: 8.2, isUp: true },
  { label: "Total Savings", value: 1850000000, icon: PiggyBank, gradient: "from-amber-400/20 to-amber-500/5", iconBg: "bg-amber-400/10", iconColor: "text-amber-500", trend: 12.5, isUp: true },
  { label: "Total Loans", value: 2200000000, icon: HandCoins, gradient: "from-amber-600/20 to-amber-700/5", iconBg: "bg-amber-600/10", iconColor: "text-amber-700", trend: 5.3, isUp: true },
  { label: "Cash Available", value: 650000000, icon: Wallet, gradient: "from-green-500/20 to-green-600/5", iconBg: "bg-green-500/10", iconColor: "text-green-600", trend: 3.1, isUp: true },
  { label: "Income This Month", value: 185000000, icon: TrendingUp, gradient: "from-green-400/20 to-green-500/5", iconBg: "bg-green-400/10", iconColor: "text-green-500", trend: 15.8, isUp: true },
  { label: "Interest Earned", value: 42500000, icon: Percent, gradient: "from-blue-400/20 to-blue-500/5", iconBg: "bg-blue-400/10", iconColor: "text-blue-500", trend: 2.4, isUp: true },
  { label: "Penalty Revenue", value: 5800000, icon: AlertTriangle, gradient: "from-red-500/20 to-red-600/5", iconBg: "bg-red-500/10", iconColor: "text-red-600", trend: 1.2, isUp: false },
  { label: "Receivables", value: 380000000, icon: Receipt, gradient: "from-amber-500/20 to-amber-600/5", iconBg: "bg-amber-500/10", iconColor: "text-amber-600", trend: 6.7, isUp: true },
  { label: "Loan Recovery Rate", value: 94.5, icon: CheckCircle, gradient: "from-green-500/20 to-green-600/5", iconBg: "bg-green-500/10", iconColor: "text-green-600", trend: 0.8, isUp: true, suffix: "%" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<number>(0)
  const startTime = useRef<number>(0)

  useEffect(() => {
    const duration = 1200
    const start = ref.current
    const end = value
    const step = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      ref.current = Math.round(start + (end - start) * eased)
      setDisplay(ref.current)
      if (progress < 1) requestAnimationFrame(step)
    }
    startTime.current = 0
    requestAnimationFrame(step)
  }, [value])

  return <>{display.toLocaleString()}{suffix}</>
}

function Sparkline() {
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sparklineData}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B3C5D" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#0B3C5D" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke="#0B3C5D" strokeWidth={1.5} fill="url(#sparkGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="admin-stat-card animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="h-6 w-28 rounded bg-gray-200" />
        </div>
        <div className="h-9 w-9 rounded-xl bg-gray-200" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-3 w-12 rounded bg-gray-200" />
        <div className="h-3 w-20 rounded bg-gray-100" />
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="admin-card p-5 animate-pulse">
      <div className="h-4 w-36 rounded bg-gray-200 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-7 w-14 rounded-lg bg-gray-100" />
        <div className="h-7 w-14 rounded-lg bg-gray-100" />
        <div className="h-7 w-14 rounded-lg bg-gray-100" />
      </div>
      <div className="h-48 w-full rounded-xl bg-gray-100" />
    </div>
  )
}

function SkeletonState() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="mb-8 animate-pulse space-y-2">
        <div className="h-8 w-56 rounded bg-gray-200" />
        <div className="h-4 w-72 rounded bg-gray-100" />
      </div>
      <div className="mb-6 flex gap-2">
        {ranges.map((r) => (
          <div key={r} className="h-8 w-14 rounded-lg bg-gray-200" />
        ))}
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => <ChartSkeleton key={i} />)}
      </div>
      <ChartSkeleton />
    </motion.div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" className="admin-card flex flex-col items-center justify-center py-20">
      <AlertTriangle className="h-14 w-14 text-red-300" />
      <p className="mt-4 text-lg font-medium text-gray-600">Failed to load financial data</p>
      <p className="mt-1 text-sm text-gray-400">Something went wrong. Please try again.</p>
      <button
        onClick={onRetry}
        className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-light"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </motion.div>
  )
}

function StatCard({ card }: { card: StatCardDef }) {
  const Icon = card.icon
  return (
    <motion.div variants={cardVariants} className="admin-stat-card group cursor-default">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
          <p className="font-heading text-2xl font-bold text-primary">
            {card.suffix ? (
              <><AnimatedCounter value={card.value} />{card.suffix}</>
            ) : (
              <>{formatCurrency(card.value).replace(" RWF", "")} <span className="text-xs font-normal text-gray-400">RWF</span></>
            )}
          </p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110", card.iconBg)}>
          <Icon className={cn("h-5 w-5", card.iconColor)} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className={cn(
          "flex items-center gap-0.5 text-xs font-semibold",
          card.isUp ? "text-green-600" : "text-red-500"
        )}>
          {card.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {card.trend}%
        </span>
        <span className="text-xs text-gray-400">vs last period</span>
      </div>
      <div className="mt-2">
        <Sparkline />
      </div>
    </motion.div>
  )
}

interface ChartTab {
  key: string
  label: string
}

interface ChartCardProps {
  title: string
  tabs: ChartTab[]
  activeTab: string
  onTabChange: (tab: string) => void
  children: React.ReactNode
  summary?: string
}

function ChartCard({ title, tabs, activeTab, onTabChange, children, summary }: ChartCardProps) {
  return (
    <motion.div variants={cardVariants} className="admin-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="font-heading text-base font-bold text-primary">{title}</h3>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                activeTab === tab.key
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-52">
        {children}
      </div>
      {summary && (
        <p className="mt-3 text-xs text-gray-400">{summary}</p>
      )}
    </motion.div>
  )
}

export default function AdminFinancePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [range, setRange] = useState<Range>("30D")
  const [chartTabs, setChartTabs] = useState<Record<string, string>>({
    savings: "All",
    loans: "All",
    income: "All",
    cashflow: "All",
    members: "All",
  })
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    const timer = setTimeout(() => {
      if (mounted.current) {
        setLoading(false)
      }
    }, 800)
    return () => { mounted.current = false; clearTimeout(timer) }
  }, [])

  const handleRetry = useCallback(() => {
    setError(false)
    setLoading(true)
    setTimeout(() => {
      if (mounted.current) {
        setLoading(false)
      }
    }, 800)
  }, [])

  const handleChartTabChange = useCallback((chart: string, tab: string) => {
    setChartTabs((prev) => ({ ...prev, [chart]: tab }))
  }, [])

  const savingsChartTabs = [
    { key: "All", label: "All" },
    { key: "Regular", label: "Regular" },
    { key: "Premium", label: "Premium" },
  ]

  if (error) return <ErrorState onRetry={handleRetry} />
  if (loading) return <SkeletonState />

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={cardVariants} className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary sm:text-3xl">Financial Overview</h1>
          <p className="mt-1 text-gray-500">Real-time financial command center for Prime Trust Finance</p>
        </div>
        <div className="flex gap-1.5">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-lg px-3.5 py-2 text-xs font-medium transition-all",
                range === r
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white/80 border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, i) => (
          <StatCard key={i} card={card} />
        ))}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <ChartCard
          title="Monthly Savings Growth"
          tabs={savingsChartTabs}
          activeTab={chartTabs.savings}
          onTabChange={(t) => handleChartTabChange("savings", t)}
          summary="Total savings grew 15.2% compared to last quarter"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B3C5D" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0B3C5D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                formatter={(val) => [formatCurrency(Number(val || 0) * 10000000), "Savings"]}
              />
              <Area type="monotone" dataKey="savings" stroke="#0B3C5D" strokeWidth={2} fill="url(#savingsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Loan Growth"
          tabs={[
            { key: "All", label: "All" },
            { key: "Active", label: "Active" },
            { key: "Completed", label: "Completed" },
          ]}
          activeTab={chartTabs.loans}
          onTabChange={(t) => handleChartTabChange("loans", t)}
          summary="Loan portfolio expanded 8.7% month-over-month"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                formatter={(val) => [formatCurrency(Number(val || 0) * 10000000), "Loans"]}
              />
              <Bar dataKey="loans" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Income Trend"
          tabs={[
            { key: "All", label: "All" },
            { key: "Fees", label: "Fees" },
            { key: "Interest", label: "Interest" },
          ]}
          activeTab={chartTabs.income}
          onTabChange={(t) => handleChartTabChange("income", t)}
          summary="Income increased 18.3% year-to-date"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                formatter={(val) => [formatCurrency(Number(val || 0) * 10000000), "Income"]}
              />
              <Line type="monotone" dataKey="income" stroke="#F4B400" strokeWidth={2} dot={{ r: 3, fill: "#F4B400" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Cash Flow"
          tabs={[
            { key: "All", label: "All" },
            { key: "Inflow", label: "Inflow" },
            { key: "Outflow", label: "Outflow" },
          ]}
          activeTab={chartTabs.cashflow}
          onTabChange={(t) => handleChartTabChange("cashflow", t)}
          summary="Positive cash flow maintained for 8 consecutive months"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="cashflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                formatter={(val) => [formatCurrency(Number(val || 0) * 10000000), "Cash Flow"]}
              />
              <Area type="monotone" dataKey="cashFlow" stroke="#16A34A" strokeWidth={2} fill="url(#cashflowGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <motion.div variants={cardVariants}>
        <ChartCard
          title="Member Growth"
          tabs={[
            { key: "All", label: "All" },
            { key: "New", label: "New" },
            { key: "Active", label: "Active" },
          ]}
          activeTab={chartTabs.members}
          onTabChange={(t) => handleChartTabChange("members", t)}
          summary="Member base grew 70.8% this year"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="memberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B3C5D" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0B3C5D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
              />
              <Area type="monotone" dataKey="members" stroke="#0B3C5D" strokeWidth={2} fill="url(#memberGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>

      <motion.div variants={cardVariants} className="mt-8">
        <div className="admin-card overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-heading text-base font-bold text-primary">Monthly Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Savings</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Loans</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Flow</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, i) => (
                  <tr key={i} className={cn("border-b border-gray-50 transition-colors hover:bg-gray-50/50", i % 2 === 0 && "bg-gray-50/30")}>
                    <td className="px-5 py-3 font-medium text-gray-800">{row.month}</td>
                    <td className="px-5 py-3 text-right font-medium text-primary">{formatCurrency(row.savings * 10000000)}</td>
                    <td className="px-5 py-3 text-right font-medium text-secondary">{formatCurrency(row.loans * 10000000)}</td>
                    <td className="px-5 py-3 text-right font-medium text-accent">{formatCurrency(row.income * 10000000)}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-800">{formatCurrency(row.cashFlow * 10000000)}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-800">{row.members.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
