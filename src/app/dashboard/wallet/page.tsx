"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wallet, Plus, ArrowUpRight, ArrowDownRight, Copy, CheckCircle,
  CreditCard, Banknote, TrendingUp, TrendingDown, History,
  Eye, EyeOff, RefreshCw, X, Send, AlertCircle,
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

interface WalletTransaction {
  id: string
  type: "credit" | "debit"
  amount: number
  description: string
  date: string
  source: string
}

interface WalletData {
  balance: number
  walletId: string
  currency: string
  monthlyIn: number
  monthlyOut: number
  totalDeposits: number
  totalWithdrawn: number
  netPosition: number
  recentTransactions: WalletTransaction[]
}

const sourceColors: Record<string, string> = {
  savings: "bg-green-50 text-green-600", loan: "bg-blue-50 text-blue-600",
  deposit: "bg-emerald-50 text-emerald-600", withdrawal: "bg-red-50 text-red-600",
  dividend: "bg-purple-50 text-purple-600",
}

function getSourceColor(source: string): string {
  return sourceColors[source] || "bg-slate-50 text-slate-600"
}

export default function WalletPage() {
  const [data, setData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
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

  async function fetchWallet() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/dashboard/wallet")
      if (!res.ok) throw new Error("Failed to load wallet data")
      const json = await res.json()
      setData(json)
    } catch {
      setError("Could not load wallet. Try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWallet() }, [])

  function copyWalletId() {
    if (!data) return
    navigator.clipboard.writeText(data.walletId)
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

  if (loading) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-56 animate-pulse rounded-3xl bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </motion.div>
    )
  }

  if (error || !data) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50 p-12 text-center">
            <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
            <h2 className="mb-1 font-heading text-lg font-bold text-red-700">Something went wrong</h2>
            <p className="mb-4 text-sm text-red-500">{error || "Unable to load wallet data."}</p>
            <button onClick={fetchWallet}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  const { balance, walletId, currency, monthlyIn, monthlyOut, totalDeposits, totalWithdrawn, netPosition, recentTransactions } = data
  const noTx = recentTransactions.length === 0

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
                {showBalance ? formatCurrency(balance, currency) : "******"}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                  <TrendingUp className="h-3.5 w-3.5" />+{formatCurrency(monthlyIn, currency)} this month
                </div>
                <div className="flex items-center gap-1.5 text-xs text-red-300">
                  <TrendingDown className="h-3.5 w-3.5" />-{formatCurrency(monthlyOut, currency)} this month
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
            <p className="mt-0.5 font-heading text-lg font-bold text-slate-900">{formatCurrency(totalDeposits, currency)}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><CreditCard className="h-4.5 w-4.5" /></div>
            <p className="text-xs text-slate-500">Total Withdrawals</p>
            <p className="mt-0.5 font-heading text-lg font-bold text-slate-900">{formatCurrency(totalWithdrawn, currency)}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600"><TrendingUp className="h-4.5 w-4.5" /></div>
            <p className="text-xs text-slate-500">Net Position</p>
            <p className={cn("mt-0.5 font-heading text-lg font-bold", netPosition >= 0 ? "text-emerald-600" : "text-red-500")}>
              {netPosition >= 0 ? "+" : ""}{formatCurrency(netPosition, currency)}
            </p>
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
            <button onClick={fetchWallet} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
          {noTx ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <History className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">No transactions yet</p>
              <p className="mt-1 text-xs text-slate-400">Use Add Money or Send to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((tx, i) => {
                const srcColor = getSourceColor(tx.source)
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
                      {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount, currency)}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          )}
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
                  <p className="text-sm text-slate-500">{formatCurrency(Number(addAmount) || 0, currency)} has been credited.</p>
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
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Amount ({currency})</label>
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
                      Add {formatCurrency(Number(addAmount) || 0, currency)}
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
                  <p className="text-sm text-slate-500">{formatCurrency(Number(sendAmount) || 0, currency)} sent successfully.</p>
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
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Amount ({currency})</label>
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
                      <Send className="h-4 w-4" /> Send {formatCurrency(Number(sendAmount) || 0, currency)}
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
