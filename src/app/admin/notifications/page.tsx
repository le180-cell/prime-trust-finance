"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell, X, AlertTriangle, CheckCircle, Clock,
  BellOff,
} from "lucide-react"
import { timeAgo, cn } from "@/lib/utils"

interface Notification {
  id: number
  type: string
  title: string
  description: string
  time: string
  read: boolean
}

const allNotifications: Notification[] = [
  { id: 1, type: "system", title: "System Update", description: "System v2.4.0 will be deployed tonight at 2AM.", time: new Date(Date.now() - 1800000).toISOString(), read: false },
  { id: 2, type: "loan", title: "Loan Approved", description: "Loan #LN-2026-042 for John Doe has been approved.", time: new Date(Date.now() - 3600000).toISOString(), read: false },
  { id: 3, type: "pending", title: "Pending Approval", description: "New member registration requires your review.", time: new Date(Date.now() - 7200000).toISOString(), read: false },
  { id: 4, type: "system", title: "Database Backup", description: "Daily backup completed successfully.", time: new Date(Date.now() - 14400000).toISOString(), read: true },
  { id: 5, type: "loan", title: "Payment Reminder", description: "Loan repayment for Carol W. is due tomorrow.", time: new Date(Date.now() - 28800000).toISOString(), read: true },
  { id: 6, type: "pending", title: "Document Review", description: "Uploaded ID documents awaiting verification.", time: new Date(Date.now() - 86400000).toISOString(), read: true },
  { id: 7, type: "system", title: "Security Alert", description: "New login from unrecognized device detected.", time: new Date(Date.now() - 172800000).toISOString(), read: true },
  { id: 8, type: "loan", title: "Interest Rate Change", description: "Loan interest rates updated to 12% APR.", time: new Date(Date.now() - 259200000).toISOString(), read: true },
]

const tabs = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "system", label: "System Alerts" },
  { id: "loan", label: "Loan Reminders" },
  { id: "pending", label: "Pending Approvals" },
]

const typeIcons: Record<string, typeof Bell> = {
  system: AlertTriangle, loan: CheckCircle, pending: Clock,
}

const typeColors: Record<string, string> = {
  system: "bg-amber-50 text-amber-700 border-amber-100",
  loan: "bg-green-50 text-green-700 border-green-100",
  pending: "bg-blue-50 text-blue-700 border-blue-100",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

export default function NotificationsPage() {
  const [loading] = useState(false)
  const [tab, setTab] = useState("all")
  const [notifications, setNotifications] = useState<Notification[]>(allNotifications)

  const filtered = notifications.filter((n) => {
    if (tab === "all") return true
    if (tab === "unread") return !n.read
    return n.type === tab
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const remove = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-56 rounded-lg bg-gray-200" />
        <div className="h-4 w-64 rounded bg-gray-100" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-9 w-28 rounded-xl bg-gray-100" />)}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="admin-card p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gray-100" />
              <div className="flex-1">
                <div className="h-4 w-40 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-64 rounded bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#0B3C5D] sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-gray-500">{unreadCount} unread · {notifications.length} total</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 shadow-sm">
            <BellOff className="h-4 w-4" />
            Mark All Read
          </button>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6 flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-all",
              tab === t.id
                ? "bg-[#0B3C5D] text-white shadow-sm"
                : "bg-white/80 border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            {t.label}
            {t.id === "all" && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">{notifications.length}</span>
            )}
            {t.id === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-[#F4B400] px-1.5 py-0.5 text-xs text-white">{unreadCount}</span>
            )}
          </button>
        ))}
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={itemVariants} className="admin-card p-14 text-center">
          <Bell className="mx-auto h-14 w-14 text-gray-300" />
          <p className="mt-4 text-gray-500 text-lg">No notifications</p>
          <p className="text-sm text-gray-400 mt-1">You&apos;re all caught up!</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-3">
          <AnimatePresence>
            {filtered.map((n, i) => {
              const Icon = typeIcons[n.type] || Bell
              const colorClass = typeColors[n.type] || "bg-gray-50 text-gray-600 border-gray-100"
              return (
                <motion.div
                  key={n.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                  layout
                  transition={{ delay: i * 0.03 }}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "admin-card group flex items-start gap-4 p-4 cursor-pointer transition-all hover:shadow-md",
                    !n.read && "border-l-4 border-l-[#0B3C5D] bg-[#0B3C5D]/[0.02]"
                  )}
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", colorClass)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={cn("text-sm", !n.read ? "font-semibold text-gray-900" : "text-gray-700")}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(n.time)}</span>
                        {!n.read && <span className="h-2 w-2 rounded-full bg-[#0B3C5D]" />}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(n.id) }}
                    className="flex-shrink-0 rounded-lg p-1 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}
