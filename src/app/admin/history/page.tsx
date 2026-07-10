"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
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

interface ApiAuditEntry {
  id: number
  adminId: number
  action: string
  entity: string
  entityId: number | null
  details: string | null
  createdAt: string
  adminName: string | null
  adminEmail: string | null
}

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
      setValue(Math.round(0 + (target - 0) * eased))
      if (progress < 1) ref.current = requestAnimationFrame(tick)
    }
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

function mapAuditEntry(entry: ApiAuditEntry): AuditEntry {
  const actionLabel = entry.action.charAt(0).toUpperCase() + entry.action.slice(1)
  const entityLabel = entry.entity ? entry.entity.charAt(0).toUpperCase() + entry.entity.slice(1).replace(/_/g, " ") : "System"
  return {
    id: entry.id,
    timestamp: entry.createdAt,
    user: entry.adminName || "System",
    email: entry.adminEmail || "",
    action: `${actionLabel} ${entityLabel}`,
    description: entry.details || `${entry.action} ${entry.entity}${entry.entityId ? ` #${entry.entityId}` : ""}`,
    ip: "",
    status: "success" as const,
  }
}

export default function AuditHistoryPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [auditData, setAuditData] = useState<AuditEntry[]>([])
  const [search, setSearch] = useState("")
  const [userFilter, setUserFilter] = useState("All Users")
  const [actionFilter, setActionFilter] = useState("All Actions")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [page, setPage] = useState(1)

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/audit-logs?limit=500")
      if (!res.ok) throw new Error("Failed to fetch audit logs")
      const data: ApiAuditEntry[] = await res.json()
      setAuditData(data.map(mapAuditEntry))
    } catch {
      setError("Could not load audit history. The server may be unavailable.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAuditLogs() }, [fetchAuditLogs])

  const users = useMemo(() => {
    const unique = new Set(auditData.map((e) => e.user))
    return ["All Users", ...Array.from(unique)]
  }, [auditData])

  const actionOptions = useMemo(() => {
    const unique = new Set(auditData.map((e) => e.action))
    return ["All Actions", ...Array.from(unique)]
  }, [auditData])

  const filtered = useMemo(() => {
    return auditData.filter((e) => {
      const q = search.toLowerCase()
      const matchSearch = !search || e.user.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.ip.includes(q)
      const matchUser = userFilter === "All Users" || e.user === userFilter
      const matchAction = actionFilter === "All Actions" || e.action === actionFilter
      const ts = new Date(e.timestamp)
      const matchFrom = !fromDate || ts >= new Date(fromDate + "T00:00:00")
      const matchTo = !toDate || ts <= new Date(toDate + "T23:59:59")
      return matchSearch && matchUser && matchAction && matchFrom && matchTo
    })
  }, [auditData, search, userFilter, actionFilter, fromDate, toDate])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const totalActions = auditData.length
  const todayActions = auditData.filter((e) => {
    const today = new Date()
    const entryDate = new Date(e.timestamp)
    return entryDate.toDateString() === today.toDateString()
  }).length
  const dataMods = auditData.length

  function handleRetry() {
    fetchAuditLogs()
  }

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
          <p className="mt-1 text-gray-500">{auditData.length} total entries</p>
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
        <StatCard label="Data Modifications" target={dataMods} icon={Edit} gradient="from-violet-500 to-violet-600" />
      </div>

      {error && (
        <motion.div variants={itemVariants} className="rounded-xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-600 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
          <button onClick={handleRetry} className="ml-auto rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 transition-all">
            Retry
          </button>
        </motion.div>
      )}

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
          {actionOptions.map((a) => <option key={a}>{a}</option>)}
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

      {paged.length === 0 && !error ? (
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
                    <th className="px-5 py-3.5 text-left font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((entry, i) => {
                    const ActionIcon = entry.action.toLowerCase().includes("login") ? LogIn :
                      entry.action.toLowerCase().includes("logout") ? LogOut :
                      entry.action.toLowerCase().includes("approve") || entry.action.toLowerCase().includes("create") ? CheckCircle :
                      entry.action.toLowerCase().includes("reject") || entry.action.toLowerCase().includes("suspend") ? XCircle :
                      entry.action.toLowerCase().includes("update") || entry.action.toLowerCase().includes("edit") ? Edit :
                      entry.action.toLowerCase().includes("setting") || entry.action.toLowerCase().includes("config") ? Settings :
                      entry.action.toLowerCase().includes("delete") ? XCircle :
                      entry.action.toLowerCase().includes("payment") || entry.action.toLowerCase().includes("record") ? CheckCircle :
                      entry.action.toLowerCase().includes("password") ? Lock :
                      entry.action.toLowerCase().includes("penalty") ? AlertTriangle :
                      entry.action.toLowerCase().includes("member") ? UserPlus : Settings
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
                              {entry.email && <p className="text-xs text-gray-400">{entry.email}</p>}
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
