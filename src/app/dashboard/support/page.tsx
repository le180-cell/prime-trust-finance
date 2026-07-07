"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare, Phone, Mail, Clock, CheckCircle, Send, ChevronDown,
  HelpCircle, FileText, Users, Shield, ChevronRight, Search,
} from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

interface Ticket {
  id: number
  subject: string
  message: string
  category: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high"
  date: string
  lastUpdate: string
}

const initialTickets: Ticket[] = [
  { id: 1, subject: "Loan Application Delay", message: "My loan application has been pending for over a week.", category: "Loan", status: "open", priority: "high", date: "2026-07-03", lastUpdate: "2026-07-04" },
  { id: 2, subject: "Statement Discrepancy", message: "My June statement shows an incorrect debit.", category: "Accounting", status: "in_progress", priority: "medium", date: "2026-07-01", lastUpdate: "2026-07-03" },
  { id: 3, subject: "Profile Update Help", message: "Unable to update my email address.", category: "Account", status: "resolved", priority: "low", date: "2026-06-28", lastUpdate: "2026-06-30" },
  { id: 4, subject: "Dividend Not Credited", message: "Expected dividend not showing in my account.", category: "Dividend", status: "closed", priority: "medium", date: "2026-06-25", lastUpdate: "2026-06-29" },
]

const faqs = [
  { q: "How do I apply for a loan?", a: "Go to Loan Applications from the sidebar, select a loan product, fill the form, and submit. You'll receive a notification once reviewed." },
  { q: "When are dividends paid?", a: "Dividends are calculated annually based on your shareholding and are paid out in June or July each year." },
  { q: "What are the loan interest rates?", a: "Interest rates vary by product. Development Loans: 12%, Emergency Loans: 15%, Education Loans: 10%, Agriculture Loans: 8% per annum." },
  { q: "How do I update my profile?", a: "Go to Profile from the sidebar, where you can change your personal details, contact info, and profile picture." },
  { q: "Can I have multiple active loans?", a: "Yes, but total outstanding loans cannot exceed 3x your total savings or the board-approved limit." },
]

const statusBadge = (status: string) => {
  const m: Record<string, string> = { open: "bg-red-50 text-red-700 border-red-200", in_progress: "bg-amber-50 text-amber-700 border-amber-200", resolved: "bg-green-50 text-green-700 border-green-200", closed: "bg-slate-50 text-slate-500 border-slate-200" }
  const l: Record<string, string> = { open: "Open", in_progress: "In Progress", resolved: "Resolved", closed: "Closed" }
  return <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium", m[status])}>{l[status]}</span>
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [activeTab, setActiveTab] = useState<"tickets" | "faq" | "new">("tickets")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [category, setCategory] = useState("General")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmitTicket() {
    if (!subject.trim() || !message.trim()) return
    const newTicket: Ticket = {
      id: Date.now(),
      subject,
      message,
      category,
      status: "open",
      priority: "medium",
      date: new Date().toISOString().split("T")[0],
      lastUpdate: new Date().toISOString().split("T")[0],
    }
    setTickets([newTicket, ...tickets])
    setSubject("")
    setMessage("")
    setCategory("General")
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0E4F75] to-[#06263C] p-6 text-white shadow-[0_24px_60px_rgba(11,60,93,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.14),transparent_26%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10"><MessageSquare className="h-6 w-6 text-accent" /></div>
              <div>
                <h1 className="font-heading text-2xl font-bold sm:text-3xl">Support</h1>
                <p className="text-sm text-white/65">We're here to help</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                <Phone className="h-4 w-4 text-accent" />
                <div><p className="text-[10px] text-white/50 uppercase tracking-wider">Call</p><p className="text-xs font-semibold">+250 788 000 000</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                <Mail className="h-4 w-4 text-accent" />
                <div><p className="text-[10px] text-white/50 uppercase tracking-wider">Email</p><p className="text-xs font-semibold">support@ias.rw</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                <Clock className="h-4 w-4 text-accent" />
                <div><p className="text-[10px] text-white/50 uppercase tracking-wider">Response</p><p className="text-xs font-semibold">Within 24 hours</p></div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-2 border-b border-slate-100">
          {(["tickets", "faq", "new"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("relative px-5 py-3 text-xs font-semibold transition-all", activeTab === tab ? "text-primary" : "text-slate-400 hover:text-slate-600")}>
              {tab === "tickets" ? "My Tickets" : tab === "faq" ? "FAQ" : "New Ticket"}
              {activeTab === tab && <motion.div layoutId="support-tab" className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </motion.div>

        {activeTab === "tickets" && (
          <motion.div variants={itemVariants} className="space-y-2">
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16">
                <CheckCircle className="h-14 w-14 text-emerald-300" />
                <p className="mt-4 text-lg font-medium text-slate-500">No tickets</p>
                <p className="text-sm text-slate-400">All your issues are resolved.</p>
              </div>
            ) : (
              tickets.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-start justify-between rounded-2xl border border-slate-100 bg-white px-5 py-4 transition-all hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800">{t.subject}</p>
                      {statusBadge(t.status)}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span>{t.category}</span>
                      <span>·</span>
                      <span>Priority: {t.priority}</span>
                      <span>·</span>
                      <span>Updated: {t.lastUpdate}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === "faq" && (
          <motion.div variants={itemVariants} className="space-y-2">
            {faqs.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-slate-100 bg-white">
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium text-slate-800">{f.q}</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", expandedFaq === i && "rotate-180")} />
                </button>
                {expandedFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 px-5 py-4">
                    <p className="text-sm text-slate-600">{f.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === "new" && (
          <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16">
                <CheckCircle className="h-16 w-16 text-emerald-500" />
                <p className="mt-4 text-xl font-bold text-slate-800">Ticket Submitted</p>
                <p className="mt-1 text-sm text-slate-500">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <h3 className="font-heading text-lg font-bold text-slate-900">Submit a Ticket</h3>
                <p className="mb-6 text-sm text-slate-500">Describe your issue and we'll respond promptly.</p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10">
                      {["General", "Loan", "Accounting", "Dividend", "Account", "Technical"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Subject</label>
                    <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of your issue"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Message</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Describe your issue in detail..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
                  </div>
                  <button onClick={handleSubmitTicket} disabled={!subject.trim() || !message.trim()}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(11,60,93,0.18)] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Send className="h-4 w-4" /> Submit Ticket
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
