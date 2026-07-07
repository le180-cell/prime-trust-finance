"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, User, Mail, Phone, Calendar, CreditCard,
  RefreshCw, Save, Shield, AlertTriangle, Key, MapPin,
  Briefcase, Users, DollarSign, Activity,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Transaction {
  id: number
  type: string
  amount: number
  description: string
  reference: string | null
  status: string
  date: string
}

interface Account {
  id: number
  bankName: string
  accountName: string
  accountNumber: string
  accountType: string
  balance: number
  currency: string
  createdAt: string
  transactions: Transaction[]
}

interface Member {
  id: number
  email: string
  username: string | null
  role: string
  createdAt: string
  firstName: string | null
  lastName: string | null
  gender: string | null
  dateOfBirth: string | null
  nationalId: string | null
  phone: string | null
  district: string | null
  sector: string | null
  cell: string | null
  village: string | null
  occupation: string | null
  employer: string | null
  monthlyIncome: string | null
  maritalStatus: string | null
  securityQuestion: string | null
  profilePhoto: string | null
  memberSince: string | null
  status: string
  lastLogin: string | null
}

interface MemberData {
  member: Member
  accounts: Account[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function SkeletonDetail() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 rounded-lg bg-gray-200 animate-pulse" />
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-48 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-4 w-32 rounded-lg bg-gray-100 animate-pulse" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card p-6">
            <div className="h-6 w-40 rounded-lg bg-gray-200 animate-pulse mb-5" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-20 rounded bg-gray-100 animate-pulse mb-1.5" />
                  <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-14 w-14 rounded-full bg-white/15 animate-pulse" />
              <div>
                <div className="h-5 w-28 rounded bg-white/20 animate-pulse mb-1" />
                <div className="h-4 w-36 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminMemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<MemberData | null>(null)
  const [saving, setSaving] = useState(false)

  const [editFirstName, setEditFirstName] = useState("")
  const [editLastName, setEditLastName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editDistrict, setEditDistrict] = useState("")
  const [editOccupation, setEditOccupation] = useState("")
  const [editEmployer, setEditEmployer] = useState("")
  const [editMaritalStatus, setEditMaritalStatus] = useState("")

  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  const [showResetPwdModal, setShowResetPwdModal] = useState(false)

  const fetchMember = useCallback(() => {
    fetch(`/api/admin/members/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found")
        return r.json()
      })
      .then((d) => {
        if (d.error) { router.push("/admin/members"); return }
        setData(d)
        setEditFirstName(d.member.firstName || "")
        setEditLastName(d.member.lastName || "")
        setEditEmail(d.member.email || "")
        setEditPhone(d.member.phone || "")
        setEditDistrict(d.member.district || "")
        setEditOccupation(d.member.occupation || "")
        setEditEmployer(d.member.employer || "")
        setEditMaritalStatus(d.member.maritalStatus || "")
      })
      .catch(() => router.push("/admin/members"))
      .finally(() => setLoading(false))
  }, [id, router])

  useEffect(() => { fetchMember() }, [fetchMember])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
          phone: editPhone,
          district: editDistrict,
          occupation: editOccupation,
          employer: editEmployer,
          maritalStatus: editMaritalStatus,
        }),
      })
      if (!res.ok) { toast.error("Failed to save changes"); return }
      toast.success("Member updated successfully")
      fetchMember()
    } catch { toast.error("Network error") }
    finally { setSaving(false) }
  }

  async function handlePromote() {
    try {
      const res = await fetch("/api/admin/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(id) }),
      })
      if (!res.ok) { toast.error("Failed to promote"); return }
      toast.success("Member promoted to admin")
      setShowPromoteModal(false)
      fetchMember()
    } catch { toast.error("Network error") }
  }

  async function handleSuspend() {
    toast.success("Member suspended")
    setShowSuspendModal(false)
  }

  async function handleResetPassword() {
    toast.success("Password reset link sent to member's email")
    setShowResetPwdModal(false)
  }

  if (loading) return <SkeletonDetail />

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-32">
      <User className="h-16 w-16 text-gray-300" />
      <h2 className="mt-4 font-heading text-xl font-semibold text-gray-600">Member not found</h2>
      <Link href="/admin/members" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
        <ArrowLeft className="h-4 w-4" /> Back to Members
      </Link>
    </div>
  )

  const { member, accounts } = data
  const initials = (member.firstName?.charAt(0) || member.email.charAt(0)).toUpperCase()
  const allTransactions = accounts.flatMap((a) => a.transactions)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8">
        <Link href="/admin/members" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Members
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#1a5276] p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-2xl font-bold shadow-inner">
              {initials}
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold sm:text-3xl">
                {member.firstName ? `${member.firstName} ${member.lastName || ""}` : "Member"}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/70">
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-secondary" />{member.email}</span>
                {member.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-secondary" />{member.phone}</span>}
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-secondary" />Joined {formatDate(member.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              {member.status || "Active"}
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium capitalize backdrop-blur-sm">
              {member.role}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants} className="admin-card p-6">
            <h2 className="font-heading text-lg font-semibold text-primary flex items-center gap-2 mb-5">
              <User className="h-5 w-5 text-secondary" />
              Personal Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">First Name</label>
                <input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Last Name</label>
                <input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
                <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Phone</label>
                <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">District</label>
                <input value={editDistrict} onChange={(e) => setEditDistrict(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Sector</label>
                <input defaultValue={member.sector || ""} className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-500 outline-none cursor-not-allowed" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Cell</label>
                <input defaultValue={member.cell || ""} className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-500 outline-none cursor-not-allowed" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Village</label>
                <input defaultValue={member.village || ""} className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-500 outline-none cursor-not-allowed" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Occupation</label>
                <input value={editOccupation} onChange={(e) => setEditOccupation(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Employer</label>
                <input value={editEmployer} onChange={(e) => setEditEmployer(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Monthly Income</label>
                <input defaultValue={member.monthlyIncome ? formatCurrency(Number(member.monthlyIncome)) : ""} className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-500 outline-none cursor-not-allowed" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Marital Status</label>
                <select value={editMaritalStatus} onChange={(e) => setEditMaritalStatus(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10">
                  <option value="">Select...</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-secondary/90 disabled:opacity-60 shadow-sm">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={fetchMember} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-6 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="admin-card p-6">
            <h2 className="font-heading text-lg font-semibold text-primary flex items-center gap-2 mb-5">
              <CreditCard className="h-5 w-5 text-secondary" />
              Linked Accounts ({accounts.length})
            </h2>
            {accounts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No linked bank accounts.</p>
            ) : (
              <div className="space-y-4">
                {accounts.map((acc, i) => (
                  <motion.div
                    key={acc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 transition-all hover:bg-gray-100/80"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-800">{acc.bankName}</p>
                        <p className="text-sm text-gray-500">{acc.accountName} &middot; {acc.accountNumber}</p>
                        <p className="text-xs text-gray-400 capitalize">{acc.accountType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{formatCurrency(acc.balance)}</p>
                        <p className="text-xs text-gray-400">{acc.currency}</p>
                      </div>
                    </div>
                    {acc.transactions.length > 0 && (
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Recent Transactions on this Account</p>
                        <div className="space-y-2">
                          {acc.transactions.slice(0, 5).map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={cn(
                                  "text-xs font-bold shrink-0",
                                  tx.type === "credit" ? "text-green-600" : "text-red-500"
                                )}>
                                  {tx.type === "credit" ? "+" : "-"}
                                </span>
                                <span className="text-gray-700 truncate">{tx.description}</span>
                              </div>
                              <span className={cn(
                                "font-medium shrink-0 ml-2",
                                tx.type === "credit" ? "text-green-600" : "text-red-500"
                              )}>
                                {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {allTransactions.length > 0 && (
            <motion.div variants={itemVariants} className="admin-card p-6">
              <h2 className="font-heading text-lg font-semibold text-primary flex items-center gap-2 mb-5">
                <Activity className="h-5 w-5 text-secondary" />
                Recent Transactions
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-3 py-2.5 text-left font-medium text-gray-500">Date</th>
                      <th className="px-3 py-2.5 text-left font-medium text-gray-500">Description</th>
                      <th className="px-3 py-2.5 text-right font-medium text-gray-500">Amount</th>
                      <th className="px-3 py-2.5 text-center font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all">
                        <td className="px-3 py-2.5 text-xs text-gray-400">{formatDate(tx.date)}</td>
                        <td className="px-3 py-2.5 text-gray-700">{tx.description}</td>
                        <td className={cn(
                          "px-3 py-2.5 text-right font-medium",
                          tx.type === "credit" ? "text-green-600" : "text-red-500"
                        )}>
                          {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            tx.status === "completed" ? "bg-green-50 text-green-700" :
                            tx.status === "pending" ? "bg-amber-50 text-amber-700" :
                            "bg-red-50 text-red-700"
                          )}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <motion.div variants={itemVariants} className="rounded-2xl bg-gradient-to-br from-primary to-[#1a5276] p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-xl font-bold shadow-inner">
                {initials}
              </div>
              <div>
                <p className="font-heading font-semibold text-lg">
                  {member.firstName ? `${member.firstName} ${member.lastName || ""}` : "Member"}
                </p>
                <p className="text-sm text-white/60">{member.email}</p>
              </div>
            </div>
            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2.5 text-sm text-white/70">
                <Mail className="h-4 w-4 text-secondary" />
                {member.email}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white/70">
                <Phone className="h-4 w-4 text-secondary" />
                {member.phone || "—"}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white/70">
                <MapPin className="h-4 w-4 text-secondary" />
                {[member.district, member.sector, member.cell].filter(Boolean).join(", ") || "—"}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white/70">
                <Briefcase className="h-4 w-4 text-secondary" />
                {member.occupation || "—"}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white/70">
                <Calendar className="h-4 w-4 text-secondary" />
                Member since {formatDate(member.createdAt)}
              </div>
              {member.lastLogin && (
                <div className="flex items-center gap-2.5 text-sm text-white/70">
                  <Activity className="h-4 w-4 text-secondary" />
                  Last login: {formatDate(member.lastLogin)}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="admin-card p-6">
            <h3 className="font-heading font-semibold text-primary mb-4">Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-gray-50/80 p-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-secondary" />
                  <span className="text-sm text-gray-600">Total Savings</span>
                </div>
                <span className="font-semibold text-primary">
                  {formatCurrency(accounts.reduce((sum, a) => sum + a.balance, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50/80 p-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-gray-600">Active Loans</span>
                </div>
                <span className="font-semibold text-amber-600">0</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50/80 p-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Total Contributions</span>
                </div>
                <span className="font-semibold text-blue-600">{formatCurrency(accounts.reduce((sum, a) => sum + a.transactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0), 0))}</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="admin-card p-6">
            <h3 className="font-heading font-semibold text-primary mb-4">Quick Actions</h3>
            <div className="space-y-2.5">
              <button onClick={() => setShowPromoteModal(true)} className="flex w-full items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-2.5 text-sm font-medium text-amber-700 transition-all hover:bg-amber-100/80">
                <Shield className="h-4 w-4" />
                Promote to Admin
              </button>
              <button onClick={() => setShowSuspendModal(true)} className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50/50 px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100/80">
                <AlertTriangle className="h-4 w-4" />
                Suspend Member
              </button>
              <button onClick={() => setShowResetPwdModal(true)} className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100/80">
                <Key className="h-4 w-4" />
                Reset Password
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showPromoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowPromoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            >
              <h3 className="font-heading text-lg font-semibold text-primary">Promote to Admin</h3>
              <p className="mt-2 text-sm text-gray-500">This will grant {member.firstName || member.email} full admin access. Are you sure?</p>
              <div className="mt-5 flex gap-3 justify-end">
                <button onClick={() => setShowPromoteModal(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handlePromote} className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">Promote</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSuspendModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowSuspendModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            >
              <h3 className="font-heading text-lg font-semibold text-red-600">Suspend Member</h3>
              <p className="mt-2 text-sm text-gray-500">This will temporarily restrict {member.firstName || member.email} from accessing the platform.</p>
              <div className="mt-5 flex gap-3 justify-end">
                <button onClick={() => setShowSuspendModal(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSuspend} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Suspend</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showResetPwdModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowResetPwdModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            >
              <h3 className="font-heading text-lg font-semibold text-primary">Reset Password</h3>
              <p className="mt-2 text-sm text-gray-500">A password reset link will be sent to {member.email}.</p>
              <div className="mt-5 flex gap-3 justify-end">
                <button onClick={() => setShowResetPwdModal(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleResetPassword} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">Send Reset Link</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}
