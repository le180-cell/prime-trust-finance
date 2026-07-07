"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CreditCard, RefreshCw, Search, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Activity,
} from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"

interface Account {
  id: number
  userId: number
  bankName: string
  accountName: string
  accountNumber: string
  accountType: string
  balance: number
  currency: string
  createdAt: string
  userEmail: string
  userRole: string
  transactionCount: number
  health: "healthy" | "warning" | "critical"
  latestTransaction: { id: number; type: string; amount: number; description: string; date: string } | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
}

function SkeletonRow() {
  return (
    <div className="rounded-[24px] bg-white/60 backdrop-blur-sm border border-white/20 p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="h-3 w-64 rounded bg-gray-100" />
        </div>
        <div className="space-y-1.5 text-right">
          <div className="h-4 w-24 rounded bg-gray-200 ml-auto" />
          <div className="h-3 w-16 rounded bg-gray-100 ml-auto" />
        </div>
      </div>
    </div>
  )
}

function MiniChart({ trend }: { trend: "up" | "down" | "stable" }) {
  const points = trend === "up"
    ? "0,20 10,18 20,22 30,15 40,10 50,12 60,5"
    : trend === "down"
    ? "0,5 10,8 20,12 30,15 40,18 50,20 60,22"
    : "0,12 10,14 20,10 30,13 40,12 50,15 60,11"
  const color = trend === "up" ? "#16A34A" : trend === "down" ? "#EF4444" : "#F4B400"
  return (
    <svg width="64" height="24" viewBox="0 0 64 24" className="flex-shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  )
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const fetchRef = useRef(0)

  useEffect(() => {
    const id = ++fetchRef.current
    fetch("/api/admin/accounts")
      .then((r) => r.json())
      .then((data) => {
        if (fetchRef.current === id) {
          setAccounts((data.accounts || []).map((a: Account) => ({
            ...a,
            health: a.balance > 1000000 ? "healthy" : a.balance > 100000 ? "warning" : "critical",
          })))
        }
      })
      .catch(() => {})
      .finally(() => { if (fetchRef.current === id) setLoading(false) })
  }, [])

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = accounts.filter(
    (a) =>
      a.bankName.toLowerCase().includes(search.toLowerCase()) ||
      a.accountName.toLowerCase().includes(search.toLowerCase()) ||
      a.accountNumber.includes(search) ||
      a.userEmail.toLowerCase().includes(search.toLowerCase())
  )

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  const refresh = () => {
    setLoading(true)
    fetch("/api/admin/accounts")
      .then((r) => r.json())
      .then((data) => setAccounts(data.accounts || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const healthColor: Record<string, string> = {
    healthy: "bg-green-500", warning: "bg-yellow-500", critical: "bg-red-500",
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div className="mb-8" variants={cardVariants}>
        <h1 className="font-heading text-2xl font-bold text-[#0B3C5D] sm:text-3xl">Bank Accounts</h1>
        <p className="mt-1 text-gray-500">
          {accounts.length} accounts · Total balance: <span className="font-semibold text-[#16A34A]">{formatCurrency(totalBalance)}</span>
        </p>
      </motion.div>

      <motion.div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" variants={cardVariants}>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bank, account name, number or email..."
            className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all"
          />
        </div>
        <button onClick={refresh} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-all">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={cardVariants} className="admin-card p-14 text-center">
          <CreditCard className="mx-auto h-14 w-14 text-gray-300" />
          <p className="mt-4 text-gray-500 text-lg">{search ? "No accounts match your search." : "No bank accounts linked yet."}</p>
        </motion.div>
      ) : (
        <motion.div className="space-y-3" variants={containerVariants}>
          <AnimatePresence>
            {filtered.map((acc) => (
              <motion.div key={acc.id} variants={cardVariants} layout className="admin-card overflow-hidden transition-all hover:shadow-md">
                <button onClick={() => toggleExpand(acc.id)} className="flex w-full items-center justify-between p-5 text-left">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex-shrink-0">
                      <CreditCard className="h-5 w-5" />
                      <span className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${healthColor[acc.health]} ring-2 ring-white`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{acc.bankName}</p>
                        <span className={`h-2 w-2 rounded-full ${healthColor[acc.health]}`} />
                      </div>
                      <p className="text-sm text-gray-500 truncate">{acc.accountName} · {acc.accountNumber}</p>
                      <p className="text-xs text-gray-400">{acc.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-semibold text-[#0B3C5D]">{formatCurrency(acc.balance)}</p>
                      <p className="text-xs text-gray-400 capitalize">{acc.accountType} · {acc.currency}</p>
                    </div>
                    <MiniChart trend={acc.balance > 500000 ? "up" : acc.balance > 100000 ? "stable" : "down"} />
                    {expanded.has(acc.id) ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                  </div>
                </button>
                <AnimatePresence>
                  {expanded.has(acc.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" as const }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 px-5 py-4">
                        <div className="grid gap-4 sm:grid-cols-3 mb-4">
                          <div className="admin-card p-3">
                            <p className="text-xs text-gray-500">Account Type</p>
                            <p className="mt-0.5 text-sm font-medium text-gray-800 capitalize">{acc.accountType}</p>
                          </div>
                          <div className="admin-card p-3">
                            <p className="text-xs text-gray-500">Transactions</p>
                            <p className="mt-0.5 text-sm font-medium text-gray-800">{acc.transactionCount}</p>
                          </div>
                          <div className="admin-card p-3">
                            <p className="text-xs text-gray-500">Linked Since</p>
                            <p className="mt-0.5 text-sm font-medium text-gray-800">{new Date(acc.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {acc.latestTransaction && (
                          <div className="admin-card p-3">
                            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                              <Activity className="h-3 w-3" /> Latest Transaction
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                                  acc.latestTransaction.type === "credit" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                                )}>
                                  {acc.latestTransaction.type === "credit" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                </span>
                                <span className="text-sm text-gray-700">{acc.latestTransaction.description}</span>
                              </div>
                              <span className={cn("text-sm font-semibold", acc.latestTransaction.type === "credit" ? "text-green-600" : "text-red-500")}>
                                {acc.latestTransaction.type === "credit" ? "+" : "-"}{formatCurrency(acc.latestTransaction.amount)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-400">{new Date(acc.latestTransaction.date).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}
