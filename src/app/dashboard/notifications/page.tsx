"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell, CheckCheck, Trash2, Settings, AlertCircle, Info,
  CheckCircle, CreditCard, User, Calendar, Megaphone,
} from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

interface Notification {
  id: number
  title: string
  message: string
  date: string
  type: "payment" | "alert" | "info" | "success" | "reminder" | "promo"
  read: boolean
}

const typeConfig = {
  payment: { icon: CreditCard, colors: "bg-blue-50 text-blue-600" },
  alert: { icon: AlertCircle, colors: "bg-red-50 text-red-600" },
  info: { icon: Info, colors: "bg-slate-50 text-slate-600" },
  success: { icon: CheckCircle, colors: "bg-emerald-50 text-emerald-600" },
  reminder: { icon: Calendar, colors: "bg-amber-50 text-amber-600" },
  promo: { icon: Megaphone, colors: "bg-purple-50 text-purple-600" },
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const Skeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex animate-pulse items-start gap-3.5 rounded-2xl border border-slate-100 bg-white px-5 py-4">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-2 w-2 rounded-full bg-slate-200" />
          </div>
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-3/4 rounded bg-slate-100" />
          <div className="h-2.5 w-16 rounded bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
)

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const res = await fetch("/api/dashboard/notifications")
      if (!res.ok) throw new Error("Failed to load notifications")
      const data = await res.json()
      const mapped: Notification[] = (data as Array<Record<string, unknown>>).map((n: Record<string, unknown>) => ({
        id: n.id as number,
        title: n.title as string,
        message: n.message as string,
        date: n.createdAt as string,
        type: n.type as Notification["type"],
        read: Boolean(n.read),
      }))
      setNotifications(mapped)
    } catch {
      setError("Could not load notifications. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length
  const filtered = filter === "all" ? notifications : notifications.filter((n) => !n.read)

  async function markAllRead() {
    try {
      const res = await fetch("/api/dashboard/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "all", read: true }),
      })
      if (!res.ok) throw new Error()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      // silently fail
    }
  }

  async function toggleRead(id: number) {
    const n = notifications.find((x) => x.id === id)
    if (!n) return
    try {
      const res = await fetch("/api/dashboard/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: !n.read }),
      })
      if (!res.ok) throw new Error()
      setNotifications((prev) => prev.map((x) => x.id === id ? { ...x, read: !x.read } : x))
    } catch {
      // silently fail
    }
  }

  async function deleteNotification(id: number) {
    try {
      const res = await fetch(`/api/dashboard/notifications?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setNotifications((prev) => prev.filter((x) => x.id !== id))
    } catch {
      // silently fail
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0E4F75] to-[#06263C] p-6 text-white shadow-[0_24px_60px_rgba(11,60,93,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.14),transparent_26%)]" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10"><Bell className="h-6 w-6 text-accent" /></div>
                <div>
                  <h1 className="font-heading text-2xl font-bold sm:text-3xl">Notifications</h1>
                  <p className="text-sm text-white/65">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={markAllRead} className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20">
                  <CheckCheck className="h-3.5 w-3.5" /> Mark All Read
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-2">
          {(["all", "unread"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                filter === f ? "bg-primary text-white shadow-[0_4px_12px_rgba(11,60,93,0.2)]" : "bg-white text-slate-500 border border-slate-200 hover:text-slate-700")}>
              {f === "all" ? "All Notifications" : `Unread (${unreadCount})`}
            </button>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          {loading ? (
            <Skeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16">
              <AlertCircle className="h-14 w-14 text-red-300" />
              <p className="mt-4 text-lg font-medium text-slate-500">{error}</p>
              <button onClick={fetchNotifications} className="mt-3 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(11,60,93,0.2)] transition hover:bg-primary/90">
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16">
              <CheckCircle className="h-14 w-14 text-emerald-300" />
              <p className="mt-4 text-lg font-medium text-slate-500">All caught up!</p>
              <p className="text-sm text-slate-400">No {filter === "unread" ? "unread " : ""}notifications.</p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((n, i) => {
                const { icon: Icon, colors } = typeConfig[n.type] || typeConfig.info
                return (
                  <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ delay: i * 0.025 }}
                    className={cn("group flex items-start gap-3.5 rounded-2xl border bg-white px-5 py-4 shadow-[0_4px_12px_rgba(15,23,42,0.03)] transition-all hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]",
                      !n.read && "border-primary/10 bg-primary/[0.02]")}>
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", colors)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm", !n.read ? "font-bold text-slate-900" : "font-medium text-slate-700")}>{n.title}</p>
                        {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{formatDate(n.date)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => toggleRead(n.id)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-primary" title={n.read ? "Mark unread" : "Mark read"}>
                        <CheckCheck className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteNotification(n.id)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
