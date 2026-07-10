"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Landmark, CheckCircle2, AlertCircle, Calendar,
  Percent, Clock, ArrowRight, ShieldCheck, Download,
  Wallet, Smartphone, Building2, X, CreditCard, Banknote,
} from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />
}

function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-48 rounded-3xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  )
}

function calculateMonthlyInstallment(principal: number, rate: number, months: number) {
  const monthlyRate = rate / 100 / 12
  if (monthlyRate === 0) return principal / months
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}

interface DashboardData {
  loan: {
    amount: number; remainingBalance: number; monthlyInstallment: number
    interest: number; disbursementDate: string; dueDate: string
    paidMonths: number; totalMonths: number; status: string
    paymentSchedule: Array<{ id?: string | number; month: string; amount: number; paid: boolean; dueDate: string }>
  } | null
  availableLoanLimit: number
}

export default function LoansPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [calcAmount, setCalcAmount] = useState(5000000)
  const [calcRate, setCalcRate] = useState(12)
  const [calcTenure, setCalcTenure] = useState(12)

  const [payModal, setPayModal] = useState<{ open: boolean; monthIndex: number; amount: number }>({ open: false, monthIndex: -1, amount: 0 })
  const [payAmount, setPayAmount] = useState(0)
  const [payMethod, setPayMethod] = useState<"bank_account" | "mobile_money" | "bank_transfer" | "cash">("mobile_money")
  const [payLoading, setPayLoading] = useState(false)
  const [paySuccess, setPaySuccess] = useState("")
  const [payError, setPayError] = useState("")
  const [bankAccounts, setBankAccounts] = useState<Array<{ id: number; bankName: string; accountName: string; accountNumber: string; balance: number }>>([])
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null)

  useEffect(() => {
    if (payModal.open) {
      setPayError("")
      setPaySuccess("")
      fetch("/api/bank-accounts")
        .then(r => r.ok ? r.json() : [])
        .then(data => {
          if (Array.isArray(data)) setBankAccounts(data)
        })
        .catch(() => {})
    }
  }, [payModal.open])

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d: DashboardData & { error?: string }) => {
        if (d.error) { setError(d.error); return }
        setData(d)
      })
      .catch(() => setError("Failed to load loan data"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSkeleton />

  if (error || !data) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800">{error || "Something went wrong"}</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5">Try Again</button>
        </div>
      </div>
    )
  }

  const { loan } = data
  const calculatedInstallment = calculateMonthlyInstallment(calcAmount, calcRate, calcTenure)

  const daysUntilNextPayment = loan
    ? Math.max(0, Math.floor((new Date(loan.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0E4F75] to-[#06263C] p-6 text-white shadow-[0_24px_60px_rgba(11,60,93,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.14),transparent_26%)]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-[18px] border-2 border-white/20 bg-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <Landmark className="h-7 w-7 text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-heading text-2xl font-bold sm:text-3xl">My Loans</h1>
                  {loan && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                      <ShieldCheck className="h-3 w-3" /> {loan.status}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-white/65">
                  {loan ? "Track your loan repayment progress" : "Explore your loan options"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-center backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/50">Available Limit</p>
              <p className="font-heading text-xl font-bold">RWF {new Intl.NumberFormat("en-US").format(data.availableLoanLimit || 0)}</p>
            </div>
          </div>
        </motion.div>

        {loan ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-slate-900">Repayment Schedule</h3>
                    <p className="text-sm text-slate-500">{loan.paidMonths} of {loan.totalMonths} months paid · {daysUntilNextPayment} days until next payment</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {loan.paymentSchedule.some((e) => !e.paid && e.month !== loan.paymentSchedule[loan.paidMonths]?.month) && (
                      <button onClick={() => {
                        const firstMissed = loan.paymentSchedule.findIndex((e) => !e.paid && e.month !== loan.paymentSchedule[loan.paidMonths]?.month)
                        if (firstMissed >= 0) {
                          setPayAmount(loan.paymentSchedule[firstMissed].amount)
                          setSelectedBankId(null)
                          setPayModal({ open: true, monthIndex: firstMissed, amount: loan.paymentSchedule[firstMissed].amount })
                        }
                      }}
                        className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100">
                        <AlertCircle className="mr-1.5 inline h-3.5 w-3.5" />Pay Overdue
                      </button>
                    )}
                    <div className="relative flex h-20 w-20 items-center justify-center">
                      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#F1F5F9" strokeWidth="6" />
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#0B3C5D" strokeWidth="6"
                          strokeDasharray={`${2 * Math.PI * 34}`}
                          strokeDashoffset={`${2 * Math.PI * 34 * (1 - loan.paidMonths / loan.totalMonths)}`}
                          strokeLinecap="round" className="transition-all duration-1000" />
                      </svg>
                      <div className="absolute text-center">
                        <p className="font-heading text-lg font-bold text-slate-900">{Math.round((loan.paidMonths / loan.totalMonths) * 100)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        <th className="pb-3 pr-4">Month</th>
                        <th className="pb-3 pr-4">Due Date</th>
                        <th className="pb-3 pr-4">Amount</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loan.paymentSchedule.map((entry, i) => (
                        <motion.tr key={entry.month} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                          className="border-b border-slate-50 transition-colors last:border-none hover:bg-slate-50/50">
                          <td className="py-3.5 pr-4"><p className="text-sm font-medium text-slate-800">{entry.month}</p></td>
                          <td className="py-3.5 pr-4"><p className="text-sm text-slate-500">{new Date(entry.dueDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</p></td>
                          <td className="py-3.5 pr-4"><p className="text-sm font-semibold text-slate-800">RWF {new Intl.NumberFormat("en-US").format(entry.amount)}</p></td>
                          <td className="py-3.5 text-right">
                            <span className="inline-flex items-center gap-2">
                              {entry.paid ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2">
                                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
                                    i === loan.paidMonths ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-500")}>
                                    {i === loan.paidMonths ? <Clock className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                                    {i === loan.paidMonths ? "Upcoming" : "Missed"}
                                  </span>
                                  <button onClick={() => { setPayAmount(entry.amount); setSelectedBankId(null); setPayModal({ open: true, monthIndex: i, amount: entry.amount }) }}
                                    className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-primary/90">
                                    Pay Now
                                  </button>
                                </span>
                              )}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
            {/* spacer */}
            <motion.div variants={itemVariants} className="space-y-5">
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
                <h3 className="font-heading text-lg font-bold text-slate-900">Loan Details</h3>
                <div className="mt-5 space-y-3">
                  {[
                    ["Loan Amount", `RWF ${new Intl.NumberFormat("en-US").format(loan.amount)}`],
                    ["Remaining Balance", `RWF ${new Intl.NumberFormat("en-US").format(loan.remainingBalance)}`],
                    ["Monthly Installment", `RWF ${new Intl.NumberFormat("en-US").format(loan.monthlyInstallment)}`],
                    ["Interest Rate", `${loan.interest}%`],
                    ["Disbursed", new Date(loan.disbursementDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })],
                    ["Next Payment", new Date(loan.dueDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-none">
                      <span className="text-sm text-slate-500">{label}</span>
                      <span className="text-sm font-semibold text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Download Agreement
                </button>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
                <h3 className="font-heading text-lg font-bold text-slate-900">Loan Calculator</h3>
                <p className="text-sm text-slate-500">Estimate monthly payments</p>
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500">Loan Amount</label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">RWF</span>
                      <input type="number" value={calcAmount} onChange={(e) => setCalcAmount(Number(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-12 pr-3 text-sm font-medium text-slate-800 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">Interest Rate (%)</label>
                    <div className="relative mt-1.5">
                      <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input type="number" value={calcRate} onChange={(e) => setCalcRate(Number(e.target.value) || 0)} step="0.1"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">Tenure (months)</label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {[6, 12, 24, 36, 48, 60].map((m) => (
                        <button key={m} onClick={() => setCalcTenure(m)}
                          className={`rounded-[10px] px-3 py-1.5 text-xs font-semibold transition-all ${calcTenure === m ? "bg-primary text-white shadow-[0_2px_8px_rgba(11,60,93,0.2)]" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
                          {m < 12 ? `${m}m` : `${m / 12}y`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-primary/60">Estimated Monthly Installment</p>
                    <p className="mt-1 font-heading text-3xl font-bold text-primary">
                      RWF {new Intl.NumberFormat("en-US").format(Math.round(calculatedInstallment))}
                    </p>
                    <p className="mt-1 text-xs text-primary/50">
                      Total payable: RWF {new Intl.NumberFormat("en-US").format(Math.round(calculatedInstallment * calcTenure))}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.08),transparent_50%)]" />
                <div className="relative mx-auto max-w-lg">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[20px] bg-primary/10">
                    <Landmark className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="mt-5 font-heading text-2xl font-bold text-slate-900">No Active Loan</h2>
                  <p className="mt-2 text-sm text-slate-500">You currently have no active loan. Apply today to access funds for your needs.</p>
                  <a href="/dashboard/loan-applications" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5">
                    Apply for a Loan <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50"><ShieldCheck className="h-5 w-5 text-emerald-600" /></div>
                <div><h3 className="font-heading text-base font-bold text-slate-900">Competitive Rates</h3><p className="text-sm text-slate-500">From as low as 9% APR</p></div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">Access affordable financing with flexible repayment terms tailored to your needs.</p>
            </motion.div>
            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50"><Calendar className="h-5 w-5 text-blue-600" /></div>
                <div><h3 className="font-heading text-base font-bold text-slate-900">Flexible Tenure</h3><p className="text-sm text-slate-500">Up to 60 months</p></div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">Choose repayment periods that suit your cash flow. Early repayment options available.</p>
            </motion.div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {payModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setPayModal({ ...payModal, open: false })}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <button onClick={() => setPayModal({ ...payModal, open: false })} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-slate-900">Make a Payment</h3>
              <p className="text-sm text-slate-500">Pay your installment for <strong>{loan?.paymentSchedule[payModal.monthIndex]?.month}</strong></p>

              {paySuccess ? (
                <div className="mt-6 text-center py-8">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="mt-4 font-heading text-xl font-bold text-slate-900">Payment Successful!</p>
                  <p className="mt-1 text-sm text-slate-500">RWF {new Intl.NumberFormat("en-US").format(payAmount)} paid via {payMethod === "bank_account" ? "Bank Account" : payMethod === "mobile_money" ? "Mobile Money" : payMethod === "bank_transfer" ? "Bank Transfer" : "Cash Deposit"}</p>
                  <button onClick={() => { setPayModal({ ...payModal, open: false }); setPaySuccess("") }}
                    className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90">Done</button>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  <div>
                    <label className="text-xs font-medium text-slate-500">Amount (RWF)</label>
                    <input type="number" value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value) || 0)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm font-medium text-slate-800 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
                    <p className="mt-1 text-xs text-slate-400">Installment due: RWF {new Intl.NumberFormat("en-US").format(payModal.amount)}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500">Payment Method</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {[
                        { value: "bank_account" as const, icon: Banknote, label: "Bank Account" },
                        { value: "mobile_money" as const, icon: Smartphone, label: "Mobile Money" },
                        { value: "bank_transfer" as const, icon: Building2, label: "Bank Transfer" },
                        { value: "cash" as const, icon: Wallet, label: "Cash Deposit" },
                      ].map((method) => (
                        <button key={method.value} onClick={() => { setPayMethod(method.value); setSelectedBankId(null); setPayError("") }}
                          className={cn("flex flex-col items-center gap-1.5 rounded-xl border p-3 transition",
                            payMethod === method.value
                              ? "border-primary/30 bg-primary/5 text-primary"
                              : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50")}>
                          <method.icon className="h-5 w-5" />
                          <span className="text-[10px] font-semibold">{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {payMethod === "bank_account" && (
                    <div>
                      <label className="text-xs font-medium text-slate-500">Select Bank Account</label>
                      {bankAccounts.length === 0 ? (
                        <div className="mt-2 rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700">
                          No linked bank accounts. <a href="/dashboard/settings" className="font-semibold underline">Link one first</a>.
                        </div>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {bankAccounts.map((acct) => (
                            <button key={acct.id} onClick={() => { setSelectedBankId(acct.id); setPayError("") }}
                              className={cn("flex w-full items-center justify-between rounded-xl border p-3 text-left transition",
                                selectedBankId === acct.id
                                  ? "border-primary/30 bg-primary/5"
                                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50")}>
                              <div>
                                <p className="text-sm font-medium text-slate-800">{acct.bankName}</p>
                                <p className="text-xs text-slate-500">{acct.accountName} · {acct.accountNumber}</p>
                              </div>
                              <p className="text-sm font-semibold text-slate-800">RWF {new Intl.NumberFormat("en-US").format(acct.balance)}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {payMethod === "mobile_money" && (
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
                      <p className="font-semibold">Mobile Money Instructions</p>
                      <p className="mt-1 text-blue-600">Dial *182*8*1# on your phone and enter the IAS account number <strong>112233</strong>. Reference: <strong>LOAN-{payModal.monthIndex + 1}</strong></p>
                    </div>
                  )}
                  {payMethod === "bank_transfer" && (
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
                      <p className="font-semibold">Bank Transfer Details</p>
                      <p className="mt-1 text-blue-600">Bank: Bank of Kigali · Acc: <strong>4000-123456-789</strong> · Name: IAS Cooperative · Reference: <strong>LOAN-{payModal.monthIndex + 1}</strong></p>
                    </div>
                  )}
                  {payMethod === "cash" && (
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
                      <p className="font-semibold">Cash Deposit</p>
                      <p className="mt-1 text-blue-600">Visit any IAS branch office with your member ID to make a cash deposit. Reference: <strong>LOAN-{payModal.monthIndex + 1}</strong></p>
                    </div>
                  )}

                  {payError && (
                    <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-600">{payError}</div>
                  )}

                  <button onClick={async () => {
                    if (payMethod === "bank_account" && !selectedBankId) { setPayError("Please select a bank account"); return }
                    if (payAmount <= 0) { setPayError("Please enter a valid amount"); return }
                    setPayLoading(true); setPayError("")
                    try {
                      const res = await fetch("/api/payments/initiate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          amount: payAmount,
                          sourceType: payMethod,
                          sourceId: payMethod === "bank_account" ? selectedBankId : undefined,
                          destinationType: "loan",
                          destinationId: loan?.paymentSchedule[payModal.monthIndex]?.id,
                          reference: `LOAN-${payModal.monthIndex + 1}`,
                        }),
                      })
                      const data = await res.json()
                      if (!res.ok) { setPayError(data.error || "Payment failed"); setPayLoading(false); return }
                      setPaySuccess(`Paid RWF ${new Intl.NumberFormat("en-US").format(payAmount)} for ${loan?.paymentSchedule[payModal.monthIndex]?.month}`)
                      if (loan) {
                        const updated = [...loan.paymentSchedule]
                        updated[payModal.monthIndex] = { ...updated[payModal.monthIndex], paid: true }
                        setData({ ...data, loan: { ...loan, paymentSchedule: updated, paidMonths: updated.filter((e) => e.paid).length, remainingBalance: data.remainingBalance ?? Math.max(0, loan.remainingBalance - payAmount) } })
                      }
                    } catch { setPayError("Network error. Please try again.") }
                    finally { setPayLoading(false) }
                  }} disabled={payLoading || payAmount <= 0}
                    className={cn("flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition",
                      payLoading || payAmount <= 0 ? "bg-slate-300 cursor-not-allowed" : "bg-primary hover:bg-primary/90")}>
                    {payLoading ? (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" /></svg>
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    {payLoading ? " Processing..." : ` Pay RWF ${new Intl.NumberFormat("en-US").format(payAmount)}`}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
