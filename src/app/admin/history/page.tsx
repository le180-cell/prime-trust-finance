"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Search, FileDown, ChevronLeft, ChevronRight, ScrollText,
  LogIn, LogOut, CheckCircle, XCircle, UserPlus, Edit,
  Settings, Lock, AlertTriangle,
} from "lucide-react"
import { formatDateTime, cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface AuditEntry {
  id: number
  timestamp: string
  user: string
  email: string
  action: string
  description: string
  ip: string
  status: "success" | "warning" | "error"
}

const mockAudit: AuditEntry[] = [
  { id: 1, timestamp: "2026-07-04T08:30:00", user: "Admin", email: "admin@ias.rw", action: "Login", description: "Admin logged in from main office", ip: "192.168.1.1", status: "success" },
  { id: 2, timestamp: "2026-07-04T08:25:00", user: "Admin", email: "admin@ias.rw", action: "Loan Approved", description: "Approved loan #1024 for Jean-Pierre Habimana (1,500,000 RWF)", ip: "192.168.1.1", status: "success" },
  { id: 3, timestamp: "2026-07-04T08:20:00", user: "Jane Smith", email: "jane@ias.rw", action: "Member Created", description: "Registered new member Alice Mugabo", ip: "192.168.1.45", status: "success" },
  { id: 4, timestamp: "2026-07-04T08:15:00", user: "John Doe", email: "john@ias.rw", action: "Payment Recorded", description: "Recorded monthly contribution for member #2301", ip: "192.168.1.22", status: "success" },
  { id: 5, timestamp: "2026-07-04T08:10:00", user: "Carol W.", email: "carol@ias.rw", action: "Loan Rejected", description: "Rejected loan #1025 due to insufficient collateral", ip: "192.168.1.78", status: "success" },
  { id: 6, timestamp: "2026-07-04T08:05:00", user: "Bob K.", email: "bob@ias.rw", action: "Penalty Applied", description: "Applied late payment penalty of 50,000 RWF to member #3154", ip: "192.168.1.34", status: "warning" },
  { id: 7, timestamp: "2026-07-04T08:00:00", user: "Admin", email: "admin@ias.rw", action: "Settings Changed", description: "Updated loan interest rate from 14% to 12% APR", ip: "192.168.1.1", status: "success" },
  { id: 8, timestamp: "2026-07-04T07:55:00", user: "Jane Smith", email: "jane@ias.rw", action: "Logout", description: "User logged out from Kigali branch terminal", ip: "192.168.1.45", status: "success" },
  { id: 9, timestamp: "2026-07-04T07:50:00", user: "John Doe", email: "john@ias.rw", action: "Password Changed", description: "Password reset for member account #2890", ip: "192.168.1.22", status: "success" },
  { id: 10, timestamp: "2026-07-04T07:45:00", user: "Carol W.", email: "carol@ias.rw", action: "Member Suspended", description: "Suspended member #4051 for non-compliance", ip: "192.168.1.78", status: "error" },
  { id: 11, timestamp: "2026-07-04T07:40:00", user: "Bob K.", email: "bob@ias.rw", action: "Loan Approved", description: "Approved loan #1026 for Marie Uwimana (3,200,000 RWF)", ip: "192.168.1.34", status: "success" },
  { id: 12, timestamp: "2026-07-04T07:35:00", user: "Admin", email: "admin@ias.rw", action: "Login", description: "Admin logged in from remote desktop", ip: "10.0.0.5", status: "success" },
  { id: 13, timestamp: "2026-07-04T07:30:00", user: "Jane Smith", email: "jane@ias.rw", action: "Payment Recorded", description: "Recorded savings deposit of 200,000 RWF for member #1123", ip: "192.168.1.45", status: "success" },
  { id: 14, timestamp: "2026-07-04T07:25:00", user: "John Doe", email: "john@ias.rw", action: "Loan Rejected", description: "Rejected loan #1027 due to existing default", ip: "192.168.1.22", status: "success" },
  { id: 15, timestamp: "2026-07-04T07:20:00", user: "Carol W.", email: "carol@ias.rw", action: "Member Created", description: "Registered new member Patrick Habimana", ip: "192.168.1.78", status: "success" },
  { id: 16, timestamp: "2026-07-04T07:15:00", user: "Bob K.", email: "bob@ias.rw", action: "Settings Changed", description: "Configured new dividend payout parameters", ip: "192.168.1.34", status: "success" },
  { id: 17, timestamp: "2026-07-04T07:10:00", user: "Admin", email: "admin@ias.rw", action: "Logout", description: "Admin logged out from main office", ip: "192.168.1.1", status: "success" },
  { id: 18, timestamp: "2026-07-04T07:05:00", user: "Jane Smith", email: "jane@ias.rw", action: "Password Changed", description: "Password reset for staff account #0082", ip: "192.168.1.45", status: "warning" },
  { id: 19, timestamp: "2026-07-04T07:00:00", user: "John Doe", email: "john@ias.rw", action: "Loan Approved", description: "Approved emergency loan #1028 for David Niyonzima (500,000 RWF)", ip: "192.168.1.22", status: "success" },
  { id: 20, timestamp: "2026-07-04T06:55:00", user: "Carol W.", email: "carol@ias.rw", action: "Penalty Applied", description: "Applied penalty of 25,000 RWF for late loan repayment #998", ip: "192.168.1.78", status: "error" },
  { id: 21, timestamp: "2026-07-04T06:50:00", user: "Bob K.", email: "bob@ias.rw", action: "Member Suspended", description: "Suspended member #5012 for fraudulent activity", ip: "192.168.1.34", status: "error" },
  { id: 22, timestamp: "2026-07-04T06:45:00", user: "Admin", email: "admin@ias.rw", action: "Settings Changed", description: "Updated system-wide contribution limits", ip: "192.168.1.1", status: "success" },
  { id: 23, timestamp: "2026-07-04T06:40:00", user: "Jane Smith", email: "jane@ias.rw", action: "Login", description: "Jane logged in from Kigali branch", ip: "192.168.1.45", status: "success" },
  { id: 24, timestamp: "2026-07-04T06:35:00", user: "John Doe", email: "john@ias.rw", action: "Logout", description: "John logged out from remote access", ip: "10.0.0.15", status: "success" },
  { id: 25, timestamp: "2026-07-04T06:30:00", user: "Carol W.", email: "carol@ias.rw", action: "Loan Approved", description: "Approved loan #1029 for Grace Uwase (2,000,000 RWF)", ip: "192.168.1.78", status: "success" },
]

const users = ["All Users", "Admin", "Jane Smith", "John Doe", "Carol W.", "Bob K."]
const actions = [
  "All Actions", "Login", "Logout", "Loan Approved", "Loan Rejected",
  "Member Created", "Member Suspended", "Payment Recorded",
  "Penalty Applied", "Settings Changed", "Password Changed",
]

const actionColors: Record<string, string> = {
  Login: "bg-blue-50 text-blue-600",
  Logout: "bg-gray-50 text-gray-600",
  "Loan Approved": "bg-green-50 text-green-600",
  "Loan Rejected": "bg-red-50 text-red-600",
  "Member Created": "bg-emerald-50 text-emerald-600",
  "Member Suspended": "bg-red-50 text-red-600",
  "Payment Recorded": "bg-emerald-50 text-emerald-600",
  "Penalty Applied": "bg-amber-50 text-amber-600",
  "Settings Changed": "bg-purple-50 text-purple-600",
  "Password Changed": "bg-orange-50 text-orange-600",
}

const statusColors: Record<string, string> = {
  success: "bg-green-50 text-green-600",
  warning: "bg-amber-50 text-amber-600",
  error: "bg-red-50 text-red-600",
}

const ITEMS_PER_PAGE = 8

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

function useAnimatedCounter(target: number, duration = 1500) {
  const [value, setValue] = useState(0)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    if (ref.current) cancelAnimationFrame(ref.current)
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(initial + (target - initial) * eased))
      if (progress < 1) ref.current = requestAnimationFrame(tick)
    }
    const initial = 0
    ref.current = requestAnimationFrame(tick)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [target, duration])

  return value
}

function Avatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  const colors = [
    "bg-[#0B3C5D] text-white",
    "bg-[#16A34A] text-white",
    "bg-[#F4B400] text-white",
    "bg-purple-600 text-white",
    "bg-rose-600 text-white",
  ]
  const colorIndex = name.length % colors.length
  return (
    <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shrink-0", colors[colorIndex])}>
      {initial}
    </div>
  )
}

function StatCard({ label, target, icon: Icon, gradient }: { label: string; target: number; icon: typeof Search; gradient: string }) {
  const count = useAnimatedCounter(target)
  return (
    <motion.div variants={itemVariants} className="admin-stat-card flex items-center gap-4">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br", gradient, "text-white shadow-sm shrink-0")}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{count.toLocaleString()}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </motion.div>
  )
}

export default function AuditHistoryPage() {
  const [loading] = useState(false)
  const [search, setSearch] = useState("")
  const [userFilter, setUserFilter] = useState("All Users")
  const [actionFilter, setActionFilter] = useState("All Actions")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [page, setPage] = useState(1)

  const filtered = mockAudit.filter((e) => {
    const q = search.toLowerCase()
    const matchSearch = !search || e.user.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.ip.includes(q)
    const matchUser = userFilter === "All Users" || e.user === userFilter
    const matchAction = actionFilter === "All Actions" || e.action === actionFilter
    const ts = new Date(e.timestamp)
    const matchFrom = !fromDate || ts >= new Date(fromDate + "T00:00:00")
    const matchTo = !toDate || ts <= new Date(toDate + "T23:59:59")
    return matchSearch && matchUser && matchAction && matchFrom && matchTo
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const totalActions = mockAudit.length
  const todayActions = mockAudit.filter((e) => {
    const today = new Date()
    const entryDate = new Date(e.timestamp)
    return entryDate.toDateString() === today.toDateString()
  }).length
  const loginEvents = mockAudit.filter((e) => e.action === "Login" || e.action === "Logout").length
  const dataMods = mockAudit.filter((e) =>
    ["Loan Approved", "Loan Rejected", "Member Created", "Member Suspended", "Settings Changed"].includes(e.action)
  ).length

  const handleExport = () => {
    toast.success("Audit log exported. File ready for download.")
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-gray-200" />
        <div className="h-4 w-72 rounded bg-gray-100" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="admin-stat-card h-24" />
          ))}
        </div>
        <div className="h-12 rounded-2xl bg-gray-100" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="admin-card p-4">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-6 w-28 rounded-full bg-gray-100" />
              <div className="h-4 w-48 rounded bg-gray-100" />
              <div className="h-4 w-24 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3C5D] sm:text-3xl">Audit History</h1>
          <p className="mt-1 text-gray-500">{mockAudit.length} total entries</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0B3C5D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B3C5D]/90 transition-all active:scale-95"
        >
          <FileDown className="h-4 w-4" /> Export Log
        </button>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Actions" target={totalActions} icon={ScrollText} gradient="from-[#0B3C5D] to-[#0B3C5D]/70" />
        <StatCard label="Today's Actions" target={todayActions} icon={LogIn} gradient="from-emerald-500 to-emerald-600" />
        <StatCard label="Login Events" target={loginEvents} icon={LogOut} gradient="from-amber-400 to-amber-500" />
        <StatCard label="Data Modifications" target={dataMods} icon={Edit} gradient="from-violet-500 to-violet-600" />
      </div>

      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by user, action, or description..."
            className="w-full rounded-xl border border-gray-200 bg-white/80 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10"
          />
        </div>
        <select
          value={userFilter}
          onChange={(e) => { setUserFilter(e.target.value); setPage(1) }}
          className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#16A34A]"
        >
          {users.map((u) => <option key={u}>{u}</option>)}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
          className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#16A34A]"
        >
          {actions.map((a) => <option key={a}>{a}</option>)}
        </select>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setPage(1) }}
          className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#16A34A]"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(1) }}
          className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#16A34A]"
        />
      </motion.div>

      {paged.length === 0 ? (
        <motion.div variants={itemVariants} className="admin-card flex flex-col items-center justify-center py-20">
          <ScrollText className="h-14 w-14 text-gray-300" />
          <p className="mt-4 text-lg text-gray-500">No audit records found</p>
          <p className="mt-1 text-sm text-gray-400">Try adjusting your search or filters.</p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants} className="admin-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
                    <th className="px-5 py-3.5 text-left font-medium text-gray-500">Timestamp</th>
                    <th className="px-5 py-3.5 text-left font-medium text-gray-500">User</th>
                    <th className="px-5 py-3.5 text-left font-medium text-gray-500">Action</th>
                    <th className="px-5 py-3.5 text-left font-medium text-gray-500">Description</th>
                    <th className="px-5 py-3.5 text-left font-medium text-gray-500">IP Address</th>
                    <th className="px-5 py-3.5 text-left font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((entry, i) => {
                    const ActionIcon = entry.action === "Login" ? LogIn :
                      entry.action === "Logout" ? LogOut :
                      entry.action === "Loan Approved" ? CheckCircle :
                      entry.action === "Loan Rejected" ? XCircle :
                      entry.action === "Member Created" ? UserPlus :
                      entry.action === "Member Suspended" ? XCircle :
                      entry.action === "Payment Recorded" ? CheckCircle :
                      entry.action === "Penalty Applied" ? AlertTriangle :
                      entry.action === "Settings Changed" ? Settings : Lock
                    const colorClass = actionColors[entry.action] || "bg-gray-50 text-gray-600"
                    return (
                      <motion.tr
                        key={entry.id}
                        variants={itemVariants}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 transition-all hover:bg-gray-50/50"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-400">{formatDateTime(entry.timestamp)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={entry.user} />
                            <div>
                              <p className="font-medium text-gray-800">{entry.user}</p>
                              <p className="text-xs text-gray-400">{entry.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", colorClass)}>
                            <ActionIcon className="h-3 w-3" />
                            {entry.action}
                          </span>
                        </td>
                        <td className="max-w-xs truncate px-5 py-4 text-gray-600">{entry.description}</td>
                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-gray-400">{entry.ip}</td>
                        <td className="px-5 py-4">
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", statusColors[entry.status])}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", entry.status === "success" ? "bg-green-500" : entry.status === "warning" ? "bg-amber-500" : "bg-red-500")} />
                            {entry.status}
                          </span>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {page} of {totalPages} ({filtered.length} entries)</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
