"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, Search, Filter, Clock, ChevronDown, User, DollarSign,
  FileText, Settings, Shield, Bell, LogIn, LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

interface ActivityItem {
  id: number
  action: string
  description: string
  date: string
  time: string
  category: "transaction" | "profile" | "loan" | "savings" | "auth" | "settings" | "notification"
}

const mockActivities: ActivityItem[] = [
  { id: 1, action: "Loan Application Submitted", description: "Development loan application for RWF 2,000,000 submitted", date: "2026-07-04", time: "10:23 AM", category: "loan" },
  { id: 2, action: "Loan Installment Paid", description: "Monthly loan installment of RWF 285,000 paid successfully", date: "2026-07-04", time: "09:15 AM", category: "transaction" },
  { id: 3, action: "Savings Deposit", description: "RWF 50,000 deposited to savings account", date: "2026-07-03", time: "02:30 PM", category: "savings" },
  { id: 4, action: "Profile Updated", description: "Phone number updated to +250 788 000 000", date: "2026-07-03", time: "11:00 AM", category: "profile" },
  { id: 5, action: "Password Changed", description: "Account password was changed successfully", date: "2026-07-02", time: "04:45 PM", category: "auth" },
  { id: 6, action: "Statement Downloaded", description: "June 2026 account statement downloaded", date: "2026-07-02", time: "03:00 PM", category: "settings" },
  { id: 7, action: "Account Login", description: "New login from Chrome on Windows", date: "2026-07-02", time: "08:00 AM", category: "auth" },
  { id: 8, action: "Notification Preferences Updated", description: "SMS notifications enabled for payment reminders", date: "2026-07-01", time: "12:15 PM", category: "notification" },
  { id: 9, action: "Loan Repayment Schedule Generated", description: "Repayment schedule for approved loan generated", date: "2026-06-30", time: "10:00 AM", category: "loan" },
  { id: 10, action: "Dividend Paid", description: "Annual dividend of RWF 25,000 credited to account", date: "2026-06-28", time: "09:00 AM", category: "transaction" },
  { id: 11, action: "Profile Picture Changed", description: "Profile picture updated", date: "2026-06-27", time: "05:20 PM", category: "profile" },
  { id: 12, action: "Account Logout", description: "Logged out from mobile device", date: "2026-06-27", time: "06:00 PM", category: "auth" },
]

const categoryIcons = {
  transaction: { icon: DollarSign, colors: "bg-emerald-50 text-emerald-600" },
  loan: { icon: FileText, colors: "bg-blue-50 text-blue-600" },
  savings: { icon: DollarSign, colors: "bg-green-50 text-green-600" },
  profile: { icon: User, colors: "bg-purple-50 text-purple-600" },
  auth: { icon: LogIn, colors: "bg-amber-50 text-amber-600" },
  settings: { icon: Settings, colors: "bg-slate-50 text-slate-600" },
  notification: { icon: Bell, colors: "bg-rose-50 text-rose-600" },
}

const categoryLabels: Record<string, string> = {
  transaction: "Transaction", loan: "Loan", savings: "Savings",
  profile: "Profile", auth: "Security", settings: "Settings", notification: "Notifications",
}

function Skeleton({ className = "" }: { className?: string }) { return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} /> }

function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-36 rounded-3xl" />
      <Skeleton className="h-14 rounded-2xl" />
      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
    </div>
  )
}

export default function ActivitiesPage() {
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("All")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const categories = ["All", ...Array.from(new Set(mockActivities.map((a) => a.category)))]
  const catLabels: Record<string, string> = { All: "All Categories", ...categoryLabels }

  const filtered = mockActivities.filter((a) => {
    if (catFilter !== "All" && a.category !== catFilter) return false
    if (search && !a.action.toLowerCase().includes(search.toLowerCase()) && !a.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const grouped = useMemo(() => {
    const groups: Record<string, ActivityItem[]> = {}
    for (const a of filtered) {
      if (!groups[a.date]) groups[a.date] = []
      groups[a.date].push(a)
    }
    return groups
  }, [filtered])

  if (loading) return <PageSkeleton />

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0E4F75] to-[#06263C] p-6 text-white shadow-[0_24px_60px_rgba(11,60,93,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.14),transparent_26%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10"><Activity className="h-6 w-6 text-accent" /></div>
              <div>
                <h1 className="font-heading text-2xl font-bold sm:text-3xl">Activity Log</h1>
                <p className="text-sm text-white/65">Track all your account activities</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search activities..."
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 pl-10 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
          </div>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-xs font-medium text-slate-600 outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10">
            {categories.map((c) => <option key={c} value={c}>{catLabels[c]}</option>)}
          </select>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16">
              <Activity className="h-14 w-14 text-slate-200" />
              <p className="mt-4 text-lg font-medium text-slate-500">No activities found</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, activities]) => (
              <div key={date}>
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{date}</span>
                  <div className="ml-2 h-px flex-1 bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {activities.map((a, i) => {
                      const { icon: Icon, colors } = categoryIcons[a.category]
                      return (
                        <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ delay: i * 0.02 }}
                          className="flex items-start gap-3.5 rounded-xl bg-white px-4 py-3.5 transition-colors hover:bg-slate-50">
                          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", colors)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-800">{a.action}</p>
                            <p className="text-xs text-slate-500">{a.description}</p>
                          </div>
                          <span className="shrink-0 text-[11px] text-slate-400">{a.time}</span>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
