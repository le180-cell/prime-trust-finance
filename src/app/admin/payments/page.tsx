"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CreditCard, DollarSign, Clock, X, AlertTriangle,
  Search, Receipt, Banknote, Landmark, Smartphone, Building2,
  Printer,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

interface Payment {
  id: number
  memberId: number
  receiptNo: string
  memberName: string
  memberInitials: string
  type: "Loan Payment" | "Savings Deposit" | "Penalty" | "Interest" | "Registration Fee"
  amount: number
  method: "Cash" | "Bank" | "Mobile Money" | "Card" | "Transfer"
  reference: string
  date: string
  status: "completed" | "pending" | "failed"
  remarks?: string
}

interface ApiPayment {
  id: number
  memberId: number
  type: string
  amount: number
  description: string
  reference: string | null
  method: string
  status: string
  paidAt: string
  firstName: string | null
  lastName: string | null
}

interface MemberOption {
  id: number
  firstName: string
  lastName: string
}

const paymentTypeColors: Record<string, string> = {
  "Loan Payment": "bg-blue-50 text-blue-700 border-blue-200",
  "Savings Deposit": "bg-green-50 text-green-700 border-green-200",
  Penalty: "bg-red-50 text-red-700 border-red-200",
  Interest: "bg-purple-50 text-purple-700 border-purple-200",
  "Registration Fee": "bg-amber-50 text-amber-700 border-amber-200",
}

const statusColors: Record<string, string> = {
  completed: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-red-50 text-red-700 border-red-200",
}

const methodIcons: Record<string, typeof Banknote> = {
  Cash: Banknote,
  Bank: Landmark,
  "Mobile Money": Smartphone,
  Card: CreditCard,
  Transfer: Building2,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

function SkeletonTable() {
  return (
    <div className="admin-card overflow-hidden p-5 space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="h-9 w-9 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-3 w-24 rounded bg-gray-100" />
          </div>
          <div className="h-4 w-20 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-100" />
          <div className="h-4 w-20 rounded bg-gray-100" />
          <div className="h-4 w-28 rounded bg-gray-100" />
          <div className="h-4 w-20 rounded bg-gray-100" />
          <div className="h-8 w-20 rounded-lg bg-gray-100" />
        </div>
      ))}
    </div>
  )
}

function toMemberName(p: ApiPayment): string {
  return [p.firstName, p.lastName].filter(Boolean).join(" ") || `Member #${p.memberId}`
}

function toInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}

const typeNormalize: Record<string, string> = {
  deposit: "Savings Deposit",
  loan_payment: "Loan Payment",
  penalty: "Penalty",
  interest: "Interest",
  registration_fee: "Registration Fee",
  "Loan Payment": "Loan Payment",
  "Savings Deposit": "Savings Deposit",
}

const methodNormalize: Record<string, string> = {
  mobile: "Mobile Money",
  cash: "Cash",
  bank: "Bank",
  card: "Card",
  transfer: "Transfer",
  Cash: "Cash",
  Bank: "Bank",
  "Mobile Money": "Mobile Money",
  Card: "Card",
  Transfer: "Transfer",
}

function mapPayment(p: ApiPayment): Payment {
  const name = toMemberName(p)
  return {
    id: p.id,
    memberId: p.memberId,
    receiptNo: `RCP-${p.reference || `PAY-${String(p.id).padStart(4, "0")}`}`,
    memberName: name,
    memberInitials: toInitials(name),
    type: (typeNormalize[p.type] || p.type) as Payment["type"],
    amount: p.amount,
    method: (methodNormalize[p.method] || "Cash") as Payment["method"],
    reference: p.reference || "",
    date: p.paidAt?.split("T")[0] || "",
    status: p.status as Payment["status"],
    remarks: p.description || undefined,
  }
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [recordModalOpen, setRecordModalOpen] = useState(false)
  const [receiptModal, setReceiptModal] = useState<Payment | null>(null)
  const [members, setMembers] = useState<MemberOption[]>([])

  const [formMemberId, setFormMemberId] = useState<number | "">("")
  const [formAmount, setFormAmount] = useState("")
  const [formType, setFormType] = useState<Payment["type"]>("Loan Payment")
  const [formReference, setFormReference] = useState("")
  const [formMethod, setFormMethod] = useState<Payment["method"]>("Cash")
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0])
  const [formRemarks, setFormRemarks] = useState("")

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/payments")
      if (!res.ok) throw new Error("Failed to fetch payments")
      const data: ApiPayment[] = await res.json()
      setPayments(data.map(mapPayment))
    } catch {
      setError("Could not load payments. The server may be unavailable.")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMembers = useCallback(async (initialId?: number) => {
    try {
      const res = await fetch("/api/admin/members")
      if (!res.ok) throw new Error("Failed to fetch members")
      const data = await res.json()
      const list: MemberOption[] = (data.members || []).map((m: Record<string, unknown>) => ({
        id: m.id as number,
        firstName: (m.firstName as string) || "",
        lastName: (m.lastName as string) || "",
      })).filter((m: MemberOption) => m.firstName || m.lastName)
      setMembers(list)
      if (initialId && list.some((m) => m.id === initialId)) {
        setFormMemberId(initialId)
      } else if (list.length > 0) {
        setFormMemberId(list[0].id)
      }
    } catch {
      // silent — members dropdown will just be empty
    }
  }, [])

  useEffect(() => { fetchPayments(); fetchMembers() }, [fetchPayments, fetchMembers])

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0]
    const todayPayments = payments.filter((p) => p.date === todayStr && p.status === "completed")
    const paymentsToday = todayPayments.length
    const totalCollected = payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0)
    const pendingConfirmations = payments.filter((p) => p.status === "pending").length
    const failedPayments = payments.filter((p) => p.status === "failed").length
    return { paymentsToday, totalCollected, pendingConfirmations, failedPayments }
  }, [payments])

  const filtered = useMemo(() => {
    if (!search) return payments
    return payments.filter((p) =>
      p.memberName.toLowerCase().includes(search.toLowerCase()) ||
      p.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
      p.reference.toLowerCase().includes(search.toLowerCase())
    )
  }, [payments, search])

  async function handleRecordPayment() {
    const amount = parseInt(formAmount)
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount.")
      return
    }
    if (!formMemberId) {
      toast.error("Please select a member.")
      return
    }

    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: formMemberId,
          type: formType,
          amount,
          description: formRemarks,
          reference: formReference || null,
          method: formMethod,
          status: "completed",
          paidAt: formDate,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to record payment")
      }

      setRecordModalOpen(false)
      setFormAmount("")
      setFormReference("")
      setFormRemarks("")
      setFormDate(new Date().toISOString().split("T")[0])
      toast.success(`Payment of ${formatCurrency(amount)} recorded. Receipt generated.`)
      fetchPayments()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to record payment")
    }
  }

  function handleRetry() {
    fetchPayments()
  }

  const selectedMemberName = useMemo(() => {
    const m = members.find((m) => m.id === formMemberId)
    return m ? `${m.firstName} ${m.lastName}` : ""
  }, [members, formMemberId])

  const summaryCards = [
    { label: "Payments Today", value: stats.paymentsToday, icon: Clock, color: "text-blue-600", bg: "bg-blue-50", suffix: " payments" },
    { label: "Total Collected", value: stats.totalCollected, icon: DollarSign, color: "text-green-600", bg: "bg-green-50", suffix: "" },
    { label: "Pending Confirmations", value: stats.pendingConfirmations, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", suffix: " pending" },
    { label: "Failed Payments", value: stats.failedPayments, icon: X, color: "text-red-600", bg: "bg-red-50", suffix: " failed" },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary sm:text-3xl flex items-center gap-3">
            Payment Center
          </h1>
          <p className="mt-1 text-gray-500">Record and manage all incoming payments.</p>
        </div>
        <button
          onClick={() => setRecordModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-secondary/90 shadow-sm hover:shadow-md"
        >
          <DollarSign className="h-4 w-4" />
          Record Payment
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="admin-stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", card.bg)}>
                  <Icon className={cn("h-5 w-5", card.color)} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <motion.span
                key={card.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gray-800"
              >
                {card.suffix.includes("payment") || card.suffix.includes("pending") || card.suffix.includes("failed")
                  ? card.value
                  : formatCurrency(card.value)}{card.suffix}
              </motion.span>
            </div>
          )
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6 flex flex-wrap gap-3">
        {Object.entries(methodIcons).map(([method, Icon]) => (
          <div
            key={method}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs font-medium text-gray-600"
          >
            <Icon className="h-4 w-4 text-gray-500" />
            {method}
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipts, members, references..."
            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 pl-10 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10"
          />
        </div>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="mb-4 rounded-xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-600 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
          <button onClick={handleRetry} className="ml-auto rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 transition-all">
            Retry
          </button>
        </motion.div>
      )}

      {loading ? (
        <SkeletonTable />
      ) : filtered.length === 0 ? (
        <motion.div variants={itemVariants} className="admin-card flex flex-col items-center justify-center py-16">
          <CreditCard className="h-14 w-14 text-gray-300" />
          <p className="mt-4 text-lg font-medium text-gray-500">No payments recorded yet</p>
          <p className="mt-1 text-sm text-gray-400">Click &quot;Record Payment&quot; to add the first entry.</p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3.5 text-left font-medium text-gray-500">Receipt</th>
                  <th className="px-4 py-3.5 text-left font-medium text-gray-500">Member</th>
                  <th className="px-4 py-3.5 text-left font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3.5 text-left font-medium text-gray-500">Amount</th>
                  <th className="px-4 py-3.5 text-left font-medium text-gray-500">Method</th>
                  <th className="px-4 py-3.5 text-left font-medium text-gray-500">Reference</th>
                  <th className="px-4 py-3.5 text-left font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3.5 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3.5 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((p, i) => {
                    const MethodIcon = methodIcons[p.method]
                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 transition-all hover:bg-gray-50/50"
                      >
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setReceiptModal(p)}
                            className="text-xs font-mono font-medium text-primary underline-offset-2 hover:underline cursor-pointer"
                          >
                            {p.receiptNo}
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white text-sm font-bold shadow-sm shrink-0">
                              {p.memberInitials}
                            </div>
                            <span className="font-medium text-gray-800">{p.memberName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium", paymentTypeColors[p.type])}>
                            {p.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-gray-800">{formatCurrency(p.amount)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                            <MethodIcon className="h-3.5 w-3.5 text-gray-400" />
                            {p.method}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-mono text-gray-500">{p.reference}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-gray-500">{formatDate(p.date)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium", statusColors[p.status])}>
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setReceiptModal(p)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            View Receipt
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Record Payment Modal */}
      <AnimatePresence>
        {recordModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setRecordModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="admin-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-lg font-semibold text-primary">Record Payment</h2>
                <button onClick={() => setRecordModalOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Member</label>
                  <select
                    value={formMemberId} onChange={(e) => setFormMemberId(Number(e.target.value) || "")}
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10"
                  >
                    {members.length === 0 && <option value="">No members available</option>}
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Amount (RWF)</label>
                  <input
                    type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Payment Type</label>
                  <div className="flex flex-wrap gap-2">
                    {(["Loan Payment", "Savings Deposit", "Penalty", "Interest", "Registration Fee"] as const).map((t) => (
                      <label
                        key={t}
                        className={cn(
                          "cursor-pointer rounded-lg border px-3.5 py-2 text-xs font-medium transition-all",
                          formType === t
                            ? "bg-primary text-white border-primary"
                            : "bg-white/80 text-gray-600 border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        <input type="radio" name="paymentType" value={t} checked={formType === t} onChange={(e) => setFormType(e.target.value as Payment["type"])} className="sr-only" />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Reference Number</label>
                  <input
                    value={formReference} onChange={(e) => setFormReference(e.target.value)}
                    placeholder="Optional reference"
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Payment Method</label>
                  <select
                    value={formMethod} onChange={(e) => setFormMethod(e.target.value as Payment["method"])}
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10"
                  >
                    {(["Cash", "Bank", "Mobile Money", "Card", "Transfer"] as const).map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Date</label>
                  <input
                    type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Remarks</label>
                  <textarea
                    value={formRemarks} onChange={(e) => setFormRemarks(e.target.value)}
                    placeholder="Optional notes..."
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10 resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setRecordModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  className="flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-secondary/90 shadow-sm"
                >
                  <DollarSign className="h-4 w-4" />
                  Record Payment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {receiptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setReceiptModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="admin-card w-full max-w-md p-0 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm">
                      IAS
                    </div>
                    <div>
                      <p className="font-heading font-bold text-primary">IAS Finance</p>
                      <p className="text-xs text-gray-400">Integrated Administration System</p>
                    </div>
                  </div>
                  <button onClick={() => setReceiptModal(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-all">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="text-center border-t border-dashed border-gray-200 pt-4">
                  <p className="text-lg font-bold text-primary">PAYMENT RECEIPT</p>
                  <p className="text-xs text-gray-400 mt-1">{receiptModal.receiptNo}</p>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-800">{formatDate(receiptModal.date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Member</span>
                  <span className="font-medium text-gray-800">{receiptModal.memberName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment Type</span>
                  <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium", paymentTypeColors[receiptModal.type])}>
                    {receiptModal.type}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Method</span>
                  <span className="inline-flex items-center gap-1.5 text-gray-600">
                    {(() => {
                      const Icon = methodIcons[receiptModal.method]
                      return <Icon className="h-3.5 w-3.5 text-gray-400" />
                    })()}
                    {receiptModal.method}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-mono text-xs text-gray-600">{receiptModal.reference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium", statusColors[receiptModal.status])}>
                    {receiptModal.status.charAt(0).toUpperCase() + receiptModal.status.slice(1)}
                  </span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Total Amount</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(receiptModal.amount)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex justify-center">
                <button
                  onClick={() => { window.print(); toast.success("Printing receipt...") }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-light shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
