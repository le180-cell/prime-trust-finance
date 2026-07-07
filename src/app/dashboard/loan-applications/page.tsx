"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, CheckCircle2, Clock, AlertCircle, ArrowRight,
  Percent, Calendar, ShieldCheck, Plus, X, Send, Calculator,
} from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
   visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
}

const loanProducts = [
  { name: "Development Loan", rate: 12, max: 50000000, min: 500000, tenure: 60, desc: "For business expansion and development projects" },
  { name: "Emergency Loan", rate: 8, max: 2000000, min: 100000, tenure: 12, desc: "Quick funding for urgent personal needs" },
  { name: "Education Loan", rate: 10, max: 10000000, min: 500000, tenure: 36, desc: "Finance your education or your children's schooling" },
  { name: "Agriculture Loan", rate: 9, max: 15000000, min: 300000, tenure: 48, desc: "Support for farming and agricultural activities" },
]

const existingApplications = [
  { id: 1, type: "Development Loan", amount: 5000000, date: "Jun 28, 2026", status: "Pending" as const },
  { id: 2, type: "Emergency Loan", amount: 500000, date: "May 15, 2026", status: "Approved" as const },
  { id: 3, type: "Education Loan", amount: 3000000, date: "Mar 10, 2026", status: "Completed" as const },
]

function calculateLoan(amount: number, rate: number, months: number) {
  const monthlyRate = rate / 100 / 12
  if (monthlyRate === 0) return { monthly: amount / months, total: amount, interest: 0 }
  const monthly = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  const total = monthly * months
  return { monthly: Math.round(monthly), total: Math.round(total), interest: Math.round(total - amount) }
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  const config: Record<string, { icon: React.FC<{ className?: string }>; className: string }> = {
    pending: { icon: Clock, className: "bg-amber-50 text-amber-700 border-amber-200" },
    approved: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    rejected: { icon: AlertCircle, className: "bg-red-50 text-red-700 border-red-200" },
    completed: { icon: CheckCircle2, className: "bg-blue-50 text-blue-700 border-blue-200" },
  }
  const c = config[s] || config.pending
  const Icon = c.icon
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", c.className)}>
      <Icon className="h-3 w-3" /> {status}
    </span>
  )
}

export default function LoanApplicationsPage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ product: "Development Loan", amount: 1000000, purpose: "", tenure: 12 })
  const [submitted, setSubmitted] = useState(false)

  const selectedProduct = loanProducts.find((p) => p.name === formData.product) || loanProducts[0]
  const calc = calculateLoan(formData.amount, selectedProduct.rate, formData.tenure)

  const isEligible = formData.amount >= selectedProduct.min && formData.amount <= selectedProduct.max && formData.tenure <= selectedProduct.tenure

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); setShowForm(false) }, 3000)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0E4F75] to-[#06263C] p-6 text-white shadow-[0_24px_60px_rgba(11,60,93,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.14),transparent_26%)]" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white/20 bg-white/10">
                <FileText className="h-7 w-7 text-accent" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold sm:text-3xl">Loan Applications</h1>
                <p className="text-sm text-white/65">Apply for a new loan or track existing applications</p>
              </div>
            </div>
            <button onClick={() => setShowForm(true)}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20">
              <Plus className="mr-1.5 inline h-4 w-4" /> New Application
            </button>
          </div>
        </motion.div>

        {submitted ? (
          <motion.div variants={itemVariants} className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mt-4 font-heading text-xl font-bold text-slate-900">Application Submitted!</h2>
            <p className="mt-1 text-sm text-slate-500">Your {formData.product} application for RWF {new Intl.NumberFormat("en-US").format(formData.amount)} has been received. We&apos;ll review and respond within 2-3 business days.</p>
          </motion.div>
        ) : null}

        <AnimatePresence>
          {showForm && !submitted && (
            <motion.div variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-lg font-bold text-slate-900">New Loan Application</h2>
                <button onClick={() => setShowForm(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Loan Product</label>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {loanProducts.map((p) => (
                        <button key={p.name} type="button" onClick={() => setFormData({ ...formData, product: p.name, amount: p.min, tenure: Math.min(formData.tenure, p.tenure) })}
                          className={cn("rounded-xl border-2 p-3 text-left transition-all", formData.product === p.name ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300")}>
                          <p className="text-sm font-bold text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>
                          <p className="text-xs text-primary font-semibold mt-1">{p.rate}% APR</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Loan Amount (RWF)</label>
                    <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                      min={selectedProduct.min} max={selectedProduct.max}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
                    <p className="mt-1 text-[11px] text-slate-400">Min: RWF {new Intl.NumberFormat("en-US").format(selectedProduct.min)} &middot; Max: RWF {new Intl.NumberFormat("en-US").format(selectedProduct.max)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Repayment Period (months)</label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {[6, 12, 24, 36, 48, 60].filter((m) => m <= selectedProduct.tenure).map((m) => (
                        <button key={m} type="button" onClick={() => setFormData({ ...formData, tenure: m })}
                          className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold transition-all", formData.tenure === m ? "bg-primary text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100")}>
                          {m < 12 ? `${m}m` : `${m / 12}y`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Purpose of Loan</label>
                    <textarea value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} rows={3} required
                      className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
                      placeholder="Briefly describe the purpose of this loan..." />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-gradient-to-br from-primary/[0.02] to-transparent p-4">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-primary" /> Loan Summary
                  </h4>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-lg bg-white p-3 border border-slate-100">
                      <p className="text-[11px] font-medium text-slate-400">Loan Amount</p>
                      <p className="text-sm font-bold text-slate-800">RWF {new Intl.NumberFormat("en-US").format(formData.amount)}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-slate-100">
                      <p className="text-[11px] font-medium text-slate-400">Interest ({selectedProduct.rate}%)</p>
                      <p className="text-sm font-bold text-slate-800">RWF {new Intl.NumberFormat("en-US").format(calc.interest)}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-slate-100">
                      <p className="text-[11px] font-medium text-slate-400">Total Repayment</p>
                      <p className="text-sm font-bold text-primary">RWF {new Intl.NumberFormat("en-US").format(calc.total)}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-slate-100">
                      <p className="text-[11px] font-medium text-slate-400">Monthly Installment</p>
                      <p className="text-sm font-bold text-secondary">RWF {new Intl.NumberFormat("en-US").format(calc.monthly)}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-slate-100">
                      <p className="text-[11px] font-medium text-slate-400">Eligibility</p>
                      <p className={cn("text-sm font-bold", isEligible ? "text-emerald-600" : "text-red-500")}>
                        {isEligible ? "Eligible" : "Not Eligible"}
                      </p>
                    </div>
                  </div>
                </div>

                {!isEligible && (
                  <div className="rounded-xl bg-amber-50/80 border border-amber-100 p-3 text-sm text-amber-700">
                    <AlertCircle className="mr-1.5 inline h-4 w-4" />
                    Amount exceeds eligible range for {formData.product}. Adjust to between RWF {new Intl.NumberFormat("en-US").format(selectedProduct.min)} and RWF {new Intl.NumberFormat("en-US").format(selectedProduct.max)}.
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button type="submit" disabled={!isEligible || !formData.purpose}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Send className="h-4 w-4" /> Submit Application
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <h3 className="font-heading text-lg font-bold text-slate-900">Application History</h3>
          <p className="text-sm text-slate-500">Track your loan applications</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {existingApplications.length === 0 ? (
                  <tr><td colSpan={4} className="py-12 text-center text-sm text-slate-400">No applications yet.</td></tr>
                ) : (
                  existingApplications.map((app, i) => (
                    <motion.tr key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-slate-50 transition-colors last:border-none hover:bg-slate-50/50">
                      <td className="py-3.5 pr-4"><p className="text-sm font-medium text-slate-800">{app.type}</p></td>
                      <td className="py-3.5 pr-4"><p className="text-sm font-semibold text-slate-800">RWF {new Intl.NumberFormat("en-US").format(app.amount)}</p></td>
                      <td className="py-3.5 pr-4"><p className="text-sm text-slate-500">{app.date}</p></td>
                      <td className="py-3.5 text-right"><StatusBadge status={app.status} /></td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
