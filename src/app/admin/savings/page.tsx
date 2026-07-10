"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PiggyBank, Search, Plus, X,
  RefreshCw, Eye, AlertTriangle, ArrowUpRight, ArrowDownRight,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

type SavingsStatus = "Active" | "Dormant" | "Closed"
type AccountType = "Regular" | "Premium" | "Student"

interface Transaction {
  id: number
  type: "deposit" | "withdrawal"
  amount: number
  date: string
  description: string
}

interface SavingsAccount {
  id: number
  memberId: number
  memberName: string
  memberInitials: string
  accountNumber: string
  balance: number
  interestRate: number
  status: SavingsStatus
  lastDeposit: string
  openedDate: string
  accountType: AccountType
  transactions: Transaction[]
  interestEarned: number
  totalDeposits: number
  totalWithdrawals: number
}

interface MemberOption {
  id: number
  firstName: string
  lastName: string
  email: string
}

const statusBadge: Record<SavingsStatus, string> = {
  Active: "bg-green-50 text-green-700 border-green-200",
  Dormant: "bg-amber-50 text-amber-700 border-amber-200",
  Closed: "bg-gray-50 text-gray-500 border-gray-200",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
}

function computeInitials(firstName: string, lastName: string): string {
  return `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`
}

function deriveAccountType(rate: number): AccountType {
  if (rate >= 4.5) return "Premium"
  if (rate <= 2.5) return "Student"
  return "Regular"
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(0)
  const startTime = useRef(0)

  useEffect(() => {
    const duration = 1200
    const start = ref.current
    const end = value
    const step = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      ref.current = Math.round(start + (end - start) * eased)
      setDisplay(ref.current)
      if (progress < 1) requestAnimationFrame(step)
    }
    startTime.current = 0
    requestAnimationFrame(step)
  }, [value])

  return <>{display.toLocaleString()}{suffix}</>
}

function SkeletonRow() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-4 p-4 border-b border-gray-100">
        <div className="h-9 w-9 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-3 w-24 rounded bg-gray-100" />
        </div>
        <div className="h-4 w-20 rounded bg-gray-200" />
        <div className="h-4 w-16 rounded bg-gray-100" />
        <div className="h-5 w-14 rounded-full bg-gray-200" />
        <div className="h-8 w-24 rounded bg-gray-100" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div variants={cardVariants} className="admin-card flex flex-col items-center justify-center py-20">
      <PiggyBank className="h-16 w-16 text-gray-300" />
      <p className="mt-4 text-lg font-medium text-gray-500">No savings accounts found</p>
      <p className="mt-1 text-sm text-gray-400">Create a new savings account to get started</p>
    </motion.div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div variants={cardVariants} className="admin-card flex flex-col items-center justify-center py-20">
      <AlertTriangle className="h-14 w-14 text-red-300" />
      <p className="mt-4 text-lg font-medium text-gray-600">Failed to load savings data</p>
      <p className="mt-1 text-sm text-gray-400">Something went wrong. Please try again.</p>
      <button
        onClick={onRetry}
        className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-light"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </motion.div>
  )
}

interface AddAccountModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (data: { memberId: number; memberName: string; deposit: number; type: AccountType }) => void
}

function AddAccountModal({ open, onClose, onSuccess }: AddAccountModalProps) {
  const [memberSearch, setMemberSearch] = useState("")
  const [deposit, setDeposit] = useState("")
  const [accountType, setAccountType] = useState<AccountType>("Regular")
  const [showDropdown, setShowDropdown] = useState(false)
  const [members, setMembers] = useState<MemberOption[]>([])
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null)
  const [loadingMembers, setLoadingMembers] = useState(false)

  useEffect(() => {
    if (open) {
      setLoadingMembers(true)
      fetch("/api/admin/members")
        .then((res) => res.json())
        .then((data) => {
          const list = (data.members as Array<Record<string, unknown>>)
            .filter((m: any) => m.firstName || m.lastName)
            .map((m: any) => ({
              id: m.id,
              firstName: m.firstName || "",
              lastName: m.lastName || "",
              email: m.email,
            }))
          setMembers(list)
        })
        .catch(() => toast.error("Failed to load members"))
        .finally(() => setLoadingMembers(false))
    }
  }, [open])

  const filteredMembers = members.filter((m) =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearch.toLowerCase())
  )

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember || !deposit) {
      toast.error("Please select a member and enter a deposit amount")
      return
    }
    const amount = parseInt(deposit, 10)
    if (isNaN(amount) || amount < 0) {
      toast.error("Invalid deposit amount")
      return
    }
    onSuccess({ memberId: selectedMember.id, memberName: `${selectedMember.firstName} ${selectedMember.lastName}`, deposit: amount, type: accountType })
    setMemberSearch("")
    setDeposit("")
    setAccountType("Regular")
    setSelectedMember(null)
    onClose()
  }, [selectedMember, deposit, accountType, onSuccess, onClose])

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="admin-card w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-heading text-lg font-bold text-primary">New Savings Account</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Member</label>
            <input
              value={memberSearch}
              onChange={(e) => { setMemberSearch(e.target.value); setShowDropdown(true); setSelectedMember(null) }}
              onFocus={() => setShowDropdown(true)}
              placeholder={selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : "Search member..."}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            />
            {showDropdown && filteredMembers.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                {loadingMembers ? (
                  <div className="px-4 py-3 text-sm text-gray-400">Loading members...</div>
                ) : (
                  filteredMembers.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { setSelectedMember(m); setMemberSearch(""); setShowDropdown(false) }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
                    >
                      {m.firstName} {m.lastName}
                      <span className="ml-2 text-xs text-gray-400">{m.email}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Initial Deposit (RWF)</label>
            <input
              type="number"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              placeholder="Enter amount (0 for no initial deposit)"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Type</label>
            <div className="flex gap-2">
              {(["Regular", "Premium", "Student"] as AccountType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAccountType(t)}
                  className={cn(
                    "flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                    accountType === t
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedMember}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Savings Account
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function AdminSavingsPage() {
  const [accounts, setAccounts] = useState<SavingsAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const mounted = useRef(false)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch("/api/admin/savings")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      if (!mounted.current) return
      const mapped: SavingsAccount[] = (data as Array<Record<string, unknown>>).map((item: any) => {
        const firstName = item.firstName || ""
        const lastName = item.lastName || ""
        const txs: Transaction[] = (item.transactions || []).map((tx: any) => ({
          id: tx.id,
          type: tx.type === "withdrawal" || tx.type === "withdraw" ? "withdrawal" as const : "deposit" as const,
          amount: tx.amount,
          date: tx.createdAt || tx.date,
          description: tx.description || "",
        }))
        const lastDepositTx = txs.find((t) => t.type === "deposit")
        return {
          id: item.id,
          memberId: item.memberId,
          memberName: `${firstName} ${lastName}`.trim(),
          memberInitials: computeInitials(firstName, lastName),
          accountNumber: `SAV-${String(item.id).padStart(4, "0")}`,
          balance: item.balance || 0,
          interestRate: item.interestRate || 0,
          status: (item.status === "active" ? "Active" : item.status === "dormant" ? "Dormant" : "Closed") as SavingsStatus,
          lastDeposit: lastDepositTx?.date || item.openedAt,
          openedDate: item.openedAt,
          accountType: deriveAccountType(item.interestRate || 0),
          transactions: txs,
          interestEarned: item.interestEarned || 0,
          totalDeposits: item.totalDeposits || 0,
          totalWithdrawals: item.totalWithdrawn || 0,
        }
      })
      setAccounts(mapped)
    } catch {
      if (mounted.current) setError(true)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    fetchAccounts()
    return () => { mounted.current = false }
  }, [fetchAccounts])

  const handleRetry = useCallback(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const toggleExpand = useCallback((id: number) => {
    setExpandedId((prev) => prev === id ? null : id)
  }, [])

  const filtered = useMemo(() => {
    let result = accounts
    if (statusFilter !== "All") {
      result = result.filter((a) => a.status === statusFilter)
    }
    if (search) {
      result = result.filter((a) =>
        a.memberName.toLowerCase().includes(search.toLowerCase()) ||
        a.accountNumber.toLowerCase().includes(search.toLowerCase())
      )
    }
    return result
  }, [accounts, statusFilter, search])

  const summary = useMemo(() => {
    const active = accounts.filter((a) => a.status === "Active").length
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)
    const monthlyDeposits = accounts.reduce((s, a) => {
      const thisMonth = a.transactions.filter(
        (t) => t.type === "deposit" && t.date.startsWith("2026-07")
      )
      return s + thisMonth.reduce((ts, t) => ts + t.amount, 0)
    }, 0)
    const avgBalance = accounts.length > 0 ? totalBalance / accounts.length : 0
    return { activeAccounts: active, totalBalance, monthlyDeposits, avgBalance }
  }, [accounts])

  const handleAddAccount = useCallback(async (data: { memberId: number; memberName: string; deposit: number; type: AccountType }) => {
    try {
      const res = await fetch("/api/admin/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: data.memberId, initialDeposit: data.deposit, accountType: data.type }),
      })
      if (!res.ok) throw new Error("Failed to create account")
      toast.success(`Savings account created for ${data.memberName}`)
      fetchAccounts()
    } catch {
      toast.error("Failed to create savings account")
    }
  }, [fetchAccounts])

  const handleSuspend = useCallback(async (acc: SavingsAccount) => {
    try {
      const res = await fetch("/api/admin/savings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: acc.id, status: "dormant" }),
      })
      if (!res.ok) throw new Error("Failed to suspend account")
      setAccounts((prev) =>
        prev.map((a) => a.id === acc.id ? { ...a, status: "Dormant" as SavingsStatus } : a)
      )
      toast.success(`${acc.memberName}'s account has been suspended`)
    } catch {
      toast.error("Failed to suspend account")
    }
  }, [])

  const handleClose = useCallback(async (acc: SavingsAccount) => {
    try {
      const res = await fetch("/api/admin/savings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: acc.id, status: "closed" }),
      })
      if (!res.ok) throw new Error("Failed to close account")
      setAccounts((prev) =>
        prev.map((a) => a.id === acc.id ? { ...a, status: "Closed" as SavingsStatus } : a)
      )
      toast.success(`${acc.memberName}'s account has been closed`)
    } catch {
      toast.error("Failed to close account")
    }
  }, [])

  const filterTabs = ["All", "Active", "Dormant", "Closed"]

  if (error) return <ErrorState onRetry={handleRetry} />

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={cardVariants} className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary sm:text-3xl">Savings Management</h1>
          <p className="mt-1 text-gray-500">
            Total savings: <span className="font-semibold text-secondary">{formatCurrency(summary.totalBalance)}</span>
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-light shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Savings Account
        </button>
      </motion.div>

      {loading ? (
        <div className="admin-card overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : (
        <>
          <motion.div variants={cardVariants} className="mb-6 grid gap-4 sm:grid-cols-4">
            <div className="admin-stat-card">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Savings</p>
              <p className="mt-1 font-heading text-xl font-bold text-primary">
                {formatCurrency(summary.totalBalance).replace(" RWF", "")} <span className="text-xs font-normal text-gray-400">RWF</span>
              </p>
            </div>
            <div className="admin-stat-card">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Accounts</p>
              <p className="mt-1 font-heading text-xl font-bold text-primary">
                <AnimatedCounter value={summary.activeAccounts} />
              </p>
              <p className="mt-0.5 text-xs text-gray-400">out of {accounts.length} total</p>
            </div>
            <div className="admin-stat-card">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Deposits This Month</p>
              <p className="mt-1 font-heading text-xl font-bold text-primary">
                {formatCurrency(summary.monthlyDeposits).replace(" RWF", "")} <span className="text-xs font-normal text-gray-400">RWF</span>
              </p>
            </div>
            <div className="admin-stat-card">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Average Balance</p>
              <p className="mt-1 font-heading text-xl font-bold text-primary">
                {formatCurrency(summary.avgBalance).replace(" RWF", "")} <span className="text-xs font-normal text-gray-400">RWF</span>
              </p>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or account number..."
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 pl-10 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all",
                    statusFilter === tab
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white/80 border border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {tab === "All" ? "All" : tab}
                  {tab !== "All" && (
                    <span className="ml-1.5 text-[10px] opacity-70">
                      ({accounts.filter((a) => a.status === tab).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div variants={cardVariants} className="admin-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Account No.</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Deposit</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Opened</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filtered.map((acc) => (
                        <motion.tr
                          key={acc.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-gray-50 transition-colors hover:bg-gray-50/50 cursor-pointer"
                          onClick={() => toggleExpand(acc.id)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white text-xs font-bold shadow-sm">
                                {acc.memberInitials}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{acc.memberName}</p>
                                <p className="text-xs text-gray-400">{acc.accountType}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 font-mono text-xs">{acc.accountNumber}</td>
                          <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(acc.balance).replace(" RWF", "")}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{acc.interestRate}%</td>
                          <td className="px-4 py-3 text-center">
                            <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium", statusBadge[acc.status])}>
                              {acc.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(acc.lastDeposit)}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(acc.openedDate)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleExpand(acc.id) }}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {acc.status === "Active" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSuspend(acc) }}
                                  className="rounded-lg px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                                >
                                  Suspend
                                </button>
                              )}
                              {acc.status !== "Closed" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleClose(acc) }}
                                  className="rounded-lg px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  Close
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              <AnimatePresence>
                {expandedId !== null && (() => {
                  const acc = accounts.find((a) => a.id === expandedId)
                  if (!acc) return null
                  return (
                    <motion.div
                      key={`expanded-${expandedId}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden border-t border-gray-100"
                    >
                      <div className="p-5 bg-gray-50/30">
                        <div className="grid gap-4 sm:grid-cols-3 mb-5">
                          <div className="admin-card p-3">
                            <p className="text-xs text-gray-500">Interest Earned</p>
                            <p className="mt-0.5 text-sm font-semibold text-primary">{formatCurrency(acc.interestEarned)}</p>
                          </div>
                          <div className="admin-card p-3">
                            <p className="text-xs text-gray-500">Total Deposits</p>
                            <p className="mt-0.5 text-sm font-semibold text-green-600">{formatCurrency(acc.totalDeposits)}</p>
                          </div>
                          <div className="admin-card p-3">
                            <p className="text-xs text-gray-500">Total Withdrawals</p>
                            <p className="mt-0.5 text-sm font-semibold text-red-500">{formatCurrency(acc.totalWithdrawals)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Transaction History</p>
                          <div className="space-y-2">
                            {acc.transactions.map((tx) => (
                              <div key={tx.id} className="flex items-center justify-between admin-card p-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className={cn(
                                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold flex-shrink-0",
                                    tx.type === "deposit" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                                  )}>
                                    {tx.type === "deposit" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-sm text-gray-700">{tx.description}</p>
                                    <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
                                  </div>
                                </div>
                                <span className={cn("text-sm font-semibold flex-shrink-0", tx.type === "deposit" ? "text-green-600" : "text-red-500")}>
                                  {tx.type === "deposit" ? "+" : "-"}{formatCurrency(tx.amount).replace(" RWF", "")}
                                </span>
                              </div>
                            ))}
                            {acc.transactions.length === 0 && (
                              <p className="text-sm text-gray-400 text-center py-4">No transactions recorded</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })()}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}

      <AnimatePresence>
        {modalOpen && (
          <AddAccountModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSuccess={handleAddAccount}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
