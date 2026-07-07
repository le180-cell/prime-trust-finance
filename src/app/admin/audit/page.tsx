"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search, ChevronLeft, ChevronRight, Fingerprint,
  LogIn, LogOut, CheckCircle, XCircle, Edit, Trash2, AlertTriangle,
} from "lucide-react"
import { formatDateTime, cn } from "@/lib/utils"

interface AuditEntry {
  id: number
  timestamp: string
  userName: string
  userEmail: string
  action: string
  details: string
  ipAddress: string
}

const actions = ["All", "Login", "Logout", "Loan Approved", "Loan Rejected", "Member Created", "Data Edited", "Data Deleted"]

const actionIcons: Record<string, typeof LogIn> = {
  Login: LogIn, Logout: LogOut, "Loan Approved": CheckCircle, "Loan Rejected": XCircle,
  "Member Created": AlertTriangle, "Data Edited": Edit, "Data Deleted": Trash2,
}

const actionColors: Record<string, string> = {
  Login: "bg-blue-50 text-blue-700",
  Logout: "bg-gray-50 text-gray-600",
  "Loan Approved": "bg-green-50 text-green-700",
  "Loan Rejected": "bg-red-50 text-red-600",
  "Member Created": "bg-amber-50 text-amber-700",
  "Data Edited": "bg-amber-50 text-amber-700",
  "Data Deleted": "bg-red-50 text-red-600",
}

const mockUsers = ["Admin User", "Jane Smith", "John Doe", "Carol W.", "Bob K."]

const mockAudit: AuditEntry[] = Array.from({ length: 32 }, (_, i) => {
  const userIdx = i % mockUsers.length
  const action = ["Login", "Logout", "Loan Approved", "Loan Rejected", "Member Created", "Data Edited", "Data Deleted"][i % 7]
  const hoursAgo = i * 3
  return {
    id: i + 1,
    timestamp: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
    userName: mockUsers[userIdx],
    userEmail: `${mockUsers[userIdx].toLowerCase().replace(/\s/g, ".")}@example.com`,
    action,
    details: action === "Login" ? "User logged in from dashboard" :
      action === "Logout" ? "User logged out" :
      action === "Loan Approved" ? "Loan #LN-2026-0" + (i % 10) + " approved" :
      action === "Loan Rejected" ? "Loan #LN-2026-0" + (i % 10) + " rejected" :
      action === "Member Created" ? "New member account created" :
      action === "Data Edited" ? "Updated member profile information" :
      "Deleted expired document #DOC-2026-0" + (i % 10),
    ipAddress: `192.168.${i % 255}.${(i * 7) % 255}`,
  }
})

const ITEMS_PER_PAGE = 8

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export default function AuditPage() {
  const [loading] = useState(false)
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("All")
  const [userFilter, setUserFilter] = useState("")
  const [page, setPage] = useState(1)

  const filtered = mockAudit.filter((e) => {
    const matchSearch = e.details.toLowerCase().includes(search.toLowerCase()) ||
      e.userName.toLowerCase().includes(search.toLowerCase()) ||
      e.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      e.ipAddress.includes(search)
    const matchAction = actionFilter === "All" || e.action === actionFilter
    const matchUser = !userFilter || e.userName === userFilter
    return matchSearch && matchAction && matchUser
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-gray-200" />
        <div className="h-4 w-72 rounded bg-gray-100" />
        <div className="flex gap-3">
          <div className="h-10 w-64 rounded-xl bg-gray-100" />
          <div className="h-10 w-36 rounded-xl bg-gray-100" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="admin-card p-4">
            <div className="flex items-center gap-4">
              <div className="h-8 w-24 rounded bg-gray-200" />
              <div className="h-4 w-32 rounded bg-gray-100" />
              <div className="h-6 w-28 rounded-full bg-gray-100" />
              <div className="h-4 w-48 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={rowVariants} className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-[#0B3C5D] sm:text-3xl">Audit Logs</h1>
        <p className="mt-1 text-gray-500">{mockAudit.length} total entries</p>
      </motion.div>

      <motion.div variants={rowVariants} className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search logs..." className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
        </div>
        <select value={userFilter} onChange={(e) => { setUserFilter(e.target.value); setPage(1) }} className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] transition-all">
          <option value="">All Users</option>
          {mockUsers.map((u) => <option key={u}>{u}</option>)}
        </select>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1) }} className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] transition-all">
          {actions.map((a) => <option key={a}>{a}</option>)}
        </select>
      </motion.div>

      {paged.length === 0 ? (
        <motion.div variants={rowVariants} className="admin-card p-14 text-center">
          <Fingerprint className="mx-auto h-14 w-14 text-gray-300" />
          <p className="mt-4 text-gray-500 text-lg">No audit logs found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={containerVariants} className="admin-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3.5 text-left font-medium text-gray-500">Timestamp</th>
                    <th className="px-5 py-3.5 text-left font-medium text-gray-500">User</th>
                    <th className="px-5 py-3.5 text-left font-medium text-gray-500">Action</th>
                    <th className="px-5 py-3.5 text-left font-medium text-gray-500">Details</th>
                    <th className="px-5 py-3.5 text-right font-medium text-gray-500">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((entry, i) => {
                    const Icon = actionIcons[entry.action] || Fingerprint
                    const colorClass = actionColors[entry.action] || "bg-gray-50 text-gray-600"
                    return (
                      <motion.tr
                        key={entry.id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 transition-all hover:bg-gray-50/50"
                      >
                        <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{formatDateTime(entry.timestamp)}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-800">{entry.userName}</p>
                          <p className="text-xs text-gray-400">{entry.userEmail}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", colorClass)}>
                            <Icon className="h-3 w-3" />
                            {entry.action}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-600 max-w-xs truncate">{entry.details}</td>
                        <td className="px-5 py-4 text-right text-xs text-gray-400 font-mono">{entry.ipAddress}</td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div variants={rowVariants} className="mt-5 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {page} of {totalPages} ({filtered.length} entries)</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-40">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
