"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin,
  CreditCard, DollarSign, FileText, CheckCircle, AlertCircle, Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface CalendarEvent {
  id: number
  title: string
  date: string
  time: string | null
  type: "payment" | "meeting" | "deadline" | "disbursement" | "reminder"
  amount?: number
  description?: string
}

const typeStyles = {
  payment: "bg-red-50 border-red-200 text-red-700",
  meeting: "bg-blue-50 border-blue-200 text-blue-700",
  deadline: "bg-amber-50 border-amber-200 text-amber-700",
  disbursement: "bg-green-50 border-green-200 text-green-700",
  reminder: "bg-purple-50 border-purple-200 text-purple-700",
}

const typeIcons = {
  payment: DollarSign, meeting: MapPin, deadline: AlertCircle,
  disbursement: CreditCard, reminder: Info,
}

function Skeleton({ className = "" }: { className?: string }) { return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} /> }

function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-36 rounded-3xl" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [formTitle, setFormTitle] = useState("")
  const [formDate, setFormDate] = useState("")
  const [formTime, setFormTime] = useState("")
  const [formType, setFormType] = useState<CalendarEvent["type"]>("reminder")
  const [formAmount, setFormAmount] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch("/api/dashboard/calendar")
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((data) => setEvents(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const e of events) {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    }
    return map
  }, [events])

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : []

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
    setSelectedDate(null)
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
    setSelectedDate(null)
  }

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!formTitle || !formDate) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/dashboard/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          date: formDate,
          time: formTime || null,
          type: formType,
          amount: formAmount ? Number(formAmount) : null,
          description: formDescription || null,
        }),
      })
      if (!res.ok) throw new Error()
      const result = await res.json()
      const newEvent: CalendarEvent = {
        id: result.id,
        title: formTitle,
        date: formDate,
        time: formTime || null,
        type: formType,
        amount: formAmount ? Number(formAmount) : undefined,
        description: formDescription || undefined,
      }
      setEvents((prev) => [...prev, newEvent])
      setShowAddModal(false)
      setFormTitle("")
      setFormDate("")
      setFormTime("")
      setFormType("reminder")
      setFormAmount("")
      setFormDescription("")
    } catch {
      //
    } finally {
      setSubmitting(false)
    }
  }

  function renderCalendar() {
    const cells = []
    const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7
    for (let i = 0; i < totalCells; i++) {
      const day = i - firstDayOfWeek + 1
      const isValid = day >= 1 && day <= daysInMonth
      const dateStr = isValid ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : ""
      const isToday = dateStr === todayStr
      const hasEvent = isValid && eventsByDate[dateStr]
      const isSelected = dateStr === selectedDate

      cells.push(
        <button key={i} onClick={() => isValid && setSelectedDate(dateStr)}
          className={cn(
            "relative flex h-10 w-full items-center justify-center rounded-xl text-sm transition-all",
            isValid ? "hover:bg-slate-50 cursor-pointer" : "cursor-default",
            isSelected && "bg-primary text-white font-bold shadow-[0_4px_12px_rgba(11,60,93,0.2)]",
            isToday && !isSelected && "border border-primary/30 text-primary font-bold",
            !isValid && "text-transparent",
          )}>
          {isValid ? day : ""}
          {hasEvent && (
            <span className={cn("absolute bottom-1 h-1.5 w-1.5 rounded-full", isSelected ? "bg-white" : "bg-primary")} />
          )}
        </button>
      )
    }
    return cells
  }

  if (loading) return <PageSkeleton />

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0E4F75] to-[#06263C] p-6 text-white shadow-[0_24px_60px_rgba(11,60,93,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.14),transparent_26%)]" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10"><Calendar className="h-6 w-6 text-accent" /></div>
                <div>
                  <h1 className="font-heading text-2xl font-bold sm:text-3xl">Calendar</h1>
                  <p className="text-sm text-white/65">Track payment dates and events</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {error ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16">
            <AlertCircle className="h-14 w-14 text-red-300" />
            <p className="mt-4 text-lg font-medium text-slate-500">Failed to load calendar</p>
            <button onClick={() => { setLoading(true); setError(false); fetch("/api/dashboard/calendar").then((r) => { if (!r.ok) throw new Error(); return r.json() }).then((data) => { setEvents(data); setLoading(false) }).catch(() => setError(true)) }} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Retry</button>
          </motion.div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={prevMonth} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button>
                  <h3 className="font-heading text-lg font-bold text-slate-900">{MONTHS[currentMonth]} {currentYear}</h3>
                  <button onClick={nextMonth} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></button>
                </div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(11,60,93,0.2)] transition hover:-translate-y-0.5">
                  <Plus className="h-3.5 w-3.5" /> Add Event
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((d) => <div key={d} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <h3 className="font-heading text-base font-bold text-slate-900 mb-4">
                {selectedDate ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "Select a date"}
              </h3>
              {selectedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <CheckCircle className="h-10 w-10 text-slate-200" />
                  <p className="mt-3 text-sm text-slate-400">{selectedDate ? "No events" : "Click a date to view events"}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map((e) => {
                    const Icon = typeIcons[e.type]
                    return (
                      <div key={e.id} className={cn("rounded-xl border p-4", typeStyles[e.type])}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0" />
                          <p className="text-sm font-bold">{e.title}</p>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs opacity-75">
                          <Clock className="h-3 w-3" />
                          <span>{e.time || "All Day"}</span>
                          {e.amount ? <><span>·</span><span>RWF {new Intl.NumberFormat("en-US").format(e.amount)}</span></> : null}
                        </div>
                        {e.description ? <p className="mt-1.5 text-xs opacity-70">{e.description}</p> : null}
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {showAddModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-heading text-lg font-bold text-slate-900">New Event</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Title *</label>
                    <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10" placeholder="Event title" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Date *</label>
                    <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Time</label>
                    <input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Type</label>
                    <select value={formType} onChange={(e) => setFormType(e.target.value as CalendarEvent["type"])}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10">
                      <option value="reminder">Reminder</option>
                      <option value="payment">Payment</option>
                      <option value="meeting">Meeting</option>
                      <option value="deadline">Deadline</option>
                      <option value="disbursement">Disbursement</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Amount (RWF)</label>
                    <input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10" placeholder="0" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Description</label>
                    <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10" placeholder="Optional description" />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(11,60,93,0.18)] transition hover:-translate-y-0.5 disabled:opacity-60">
                    {submitting ? "Creating..." : "Create Event"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
