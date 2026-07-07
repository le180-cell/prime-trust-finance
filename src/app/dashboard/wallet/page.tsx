"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wallet, Plus, ArrowUpRight, ArrowDownRight, Copy, CheckCircle,
  CreditCard, Banknote, TrendingUp, TrendingDown, History,
  Eye, EyeOff, RefreshCw, X, Send,
} from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

interface WalletTransaction {
  id: number
  type: "credit" | "debit"
  amount: number
  description: string
  date: string
  source: "savings" | "loan" | "deposit" | "withdrawal" | "dividend"
}

const walletSummary = {
  balance: 1250000,
  walletId: "WAL-IAS-2026-0042",
  currency: "RWF",
  monthlyIn: 350000,
  monthlyOut: 285000,
}

const recentTx: WalletTransaction[] = [
  { id: 1, type: "credit", amount: 285000, description: "Loan disbursement - Development Loan", date: "2026-07-04", source: "loan" },
  { id: 2, type: "debit", amount: 50000, description: "Savings deposit transfer", date: "2026-07-03", source: "savings" },
  { id: 3, type: "credit", amount: 25000, description: "Annual dividend payment", date: "2026-06-28", source: "dividend" },
  { id: 4, type: "debit", amount: 150000, description: "Loan installment payment", date: "2026-06-25", source: "withdrawal" },
  { id: 5, type: "credit", amount: 100000, description: "Direct deposit - Salary", date: "2026-06-20", source: "deposit" },
]

const sourceColors: Record<string, string> = {
  savings: "bg-green-50 text-green-600", loan: "bg-blue-50 text-blue-600",
  deposit: "bg-emerald-50 text-emerald-600", withdrawal: "bg-red-50 text-red-600",
  dividend: "bg-purple-50 text-purple-600",
}

export default function WalletPage() {
  const [showBalance, setShowBalance] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [addAmount, setAddAmount] = useState("")
  const [addSource, setAddSource] = useState("bank")
  const [sendAmount, setSendAmount] = useState("")
  const [sendTo, setSendTo] = useState("")
  const [sendPurpose, setSendPurpose] = useState("")
  const [addSuccess, setAddSuccess] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  function copyWalletId() {
    navigator.clipboard.writeText(walletSummary.walletId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleAddMoney() {
    setAddSuccess(true)
    setTimeout(() => { setAddSuccess(false); setShowAddModal(false); setAddAmount("") }, 1500)
  }

  function handleSendMoney() {
    setSendSuccess(true)
    setTimeout(() => { setSendSuccess(false); setShowSendModal(false); setSendAmount(""); setSendTo(""); setSendPurpose("") }, 1500)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0E4F75] to-[#06263C] p-6 text-white shadow-[0_24px_60px_rgba(11,60,93,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.14),transparent_26%)]" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10"><Wallet className="h-6 w-6 text-accent" /></div>
                <div>
                  <h1 className="font-heading text-2xl font-bold sm:text-3xl">Digital Wallet</h1>
                  <p className="text-sm text-white/65">Your virtual IAS wallet</p>
                </div>
              </div>
              <button onClick={() => setShowBalance(!showBalance)} className="rounded-xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-md transition hover:bg-white/20">
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] px-6 py-5 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/50">Available Balance</p>
              <p className="mt-1 font-heading text-4xl font-bold tracking-tight">
                {showBalance ? `RWF ${new Intl.NumberFormat("en-US").format(walletSummary.balance)}` : "******"}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                  <TrendingUp className="h-3.5 w-3.5" />+RWF {new Intl.NumberFormat("en-US").format(walletSummary.monthlyIn)} this month
                </div>
                <div className="flex items-center gap-1.5 text-xs text-red-300">
                  <TrendingDown className="h-3.5 w-3.5" />-RWF {new Intl.NumberFormat("en-US").format(walletSummary.monthlyOut)} this month
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-primary shadow-[0_4px_12px_rgba(244,180,0,0.3)] transition hover:-translate-y-0.5">
                <Plus className="h-4 w-4" /> Add Money
              </button>
              <button onClick={() => setShowSendModal(true)} className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition hover:bg-white/20">
                <ArrowUpRight className="h-4 w-4" /> Send
              </button>
              <button onClick={copyWalletId} className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition hover:bg-white/20">
                {copied ? <CheckCircle className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Wallet ID"}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Banknote className="h-4.5 w-4.5" /></div>
            <p className="text-xs text-slate-500">Total Deposits</p>
            <p className="mt-0.5 font-heading text-lg font-bold text-slate-900">RWF 2,450,000</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><CreditCard className="h-4.5 w-4.5" /></div>
            <p className="text-xs text-slate-500">Total Withdrawals</p>
            <p className="mt-0.5 font-heading text-lg font-bold text-slate-900">RWF 1,200,000</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600"><TrendingUp className="h-4.5 w-4.5" /></div>
            <p className="text-xs text-slate-500">Net Position</p>
            <p className="mt-0.5 font-heading text-lg font-bold text-emerald-600">+RWF 1,250,000</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-600"><History className="h-4.5 w-4.5" /></div>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">Recent Activity</h3>
              </div>
            </div>
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {recentTx.map((tx, i) => {
              const srcColor = sourceColors[tx.source]
              return (
                <motion.div key={tx.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", srcColor)}>
                      {tx.type === "credit" ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{tx.description}</p>
                      <p className="text-xs text-slate-400">{tx.date}</p>
                    </div>
                  </div>
                  <p className={cn("text-sm font-bold", tx.type === "credit" ? "text-emerald-600" : "text-red-500")}>
                    {tx.type === "credit" ? "+" : "-"}RWF {new Intl.NumberFormat("en-US").format(tx.amount)}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              {addSuccess ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <CheckCircle className="h-14 w-14 text-emerald-500" />
                  <p className="mt-4 text-lg font-bold text-slate-800">Money Added!</p>
                  <p className="text-sm text-slate-500">RWF {new Intl.NumberFormat("en-US").format(Number(addAmount) || 0)} has been credited.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Plus className="h-5 w-5" /></div>
                      <h3 className="font-heading text-lg font-bold text-slate-900">Add Money</h3>
                    </div>
                    <button onClick={() => setShowAddModal(false)} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Amount (RWF)</label>
                      <input type="number" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="0"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold text-slate-900 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Source</label>
                      <select value={addSource} onChange={(e) => setAddSource(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10">
                        <option value="bank">Bank Transfer</option>
                        <option value="mobile">Mobile Money</option>
                        <option value="cash">Cash Deposit</option>
                      </select>
                    </div>
                    <button onClick={handleAddMoney} disabled={!addAmount || Number(addAmount) <= 0}
                      className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(11,60,93,0.18)] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                      Add RWF {new Intl.NumberFormat("en-US").format(Number(addAmount) || 0)}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {showSendModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              {sendSuccess ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <CheckCircle className="h-14 w-14 text-emerald-500" />
                  <p className="mt-4 text-lg font-bold text-slate-800">Sent!</p>
                  <p className="text-sm text-slate-500">RWF {new Intl.NumberFormat("en-US").format(Number(sendAmount) || 0)} sent successfully.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><ArrowUpRight className="h-5 w-5" /></div>
                      <h3 className="font-heading text-lg font-bold text-slate-900">Send Money</h3>
                    </div>
                    <button onClick={() => setShowSendModal(false)} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Recipient</label>
                      <input value={sendTo} onChange={(e) => setSendTo(e.target.value)} placeholder="Member name or wallet ID"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Amount (RWF)</label>
                      <input type="number" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} placeholder="0"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold text-slate-900 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Purpose (optional)</label>
                      <input value={sendPurpose} onChange={(e) => setSendPurpose(e.target.value)} placeholder="What's this for?"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
                    </div>
                    <button onClick={handleSendMoney} disabled={!sendTo || !sendAmount || Number(sendAmount) <= 0}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(11,60,93,0.18)] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Send className="h-4 w-4" /> Send RWF {new Intl.NumberFormat("en-US").format(Number(sendAmount) || 0)}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
