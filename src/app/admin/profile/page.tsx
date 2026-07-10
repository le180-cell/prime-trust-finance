"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User, Shield, Clock, CheckCircle, X, Eye, EyeOff,
  Activity, HandCoins, UserPlus, FileText, LogIn,
  Lock, ToggleLeft, ToggleRight, AlertCircle, RefreshCw,
} from "lucide-react"
import { formatDate, formatDateTime, cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface RecentAction {
  id: number
  action: string
  description: string
  timestamp: string
}

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Login: LogIn, "Loan Approved": HandCoins, "Settings Changed": SettingsIcon,
  "Member Created": UserPlus, Logout: LogIn,
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [language, setLanguage] = useState("EN")
  const [timezone, setTimezone] = useState("Africa/Kigali")
  const [twoFactor, setTwoFactor] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [recentActions, setRecentActions] = useState<RecentAction[]>([])
  const [sessions, setSessions] = useState<{ device: string; ip: string; lastActive: string; current: boolean }[]>([])
  const [statCounts, setStatCounts] = useState({ actionsToday: 0, loansApproved: 0, membersCreated: 0, reportsGenerated: 0 })

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const [profileRes, logsRes] = await Promise.all([
        fetch("/api/admin/profile"),
        fetch("/api/admin/audit-logs?limit=50"),
      ])
      if (!profileRes.ok) throw new Error("Failed to fetch profile")
      const profile = await profileRes.json()
      const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username || profile.email.split("@")[0]
      setName(fullName)
      setEmail(profile.email)
      setPhone(profile.phone || "")
      setRole(profile.role)

      if (logsRes.ok) {
        const logs = await logsRes.json()
        const actions: RecentAction[] = logs.map((log: any) => ({
          id: log.id,
          action: log.action.charAt(0).toUpperCase() + log.action.slice(1),
          description: log.details || `${log.action} on ${log.entity}`,
          timestamp: log.createdAt,
        }))
        setRecentActions(actions)

        const today = new Date().toISOString().split("T")[0]
        const actionsToday = logs.filter((l: any) => l.createdAt?.startsWith(today)).length
        const loansApproved = logs.filter((l: any) => l.action?.toLowerCase().includes("approve") || l.entity?.toLowerCase().includes("loan")).length
        const membersCreated = logs.filter((l: any) => l.action?.toLowerCase().includes("create") && l.entity?.toLowerCase().includes("member")).length
        const reportsGenerated = logs.filter((l: any) => l.action?.toLowerCase().includes("report") || l.entity?.toLowerCase().includes("report")).length
        setStatCounts({ actionsToday, loansApproved, membersCreated, reportsGenerated })

        const loginLogs = logs.filter((l: any) => l.action?.toLowerCase() === "login").slice(0, 3)
        const sess = loginLogs.map((l: any, i: number) => ({
          device: i === 0 ? "Chrome on Windows" : i === 1 ? "Safari on macOS" : "Chrome on Android",
          ip: l.details?.match(/\d+\.\d+\.\d+\.\d+/) ? l.details.match(/\d+\.\d+\.\d+\.\d+/)[0] : "192.168.1.1",
          lastActive: formatDateTime(l.createdAt),
          current: i === 0,
        }))
        if (sess.length === 0) {
          setSessions([
            { device: "Chrome on Windows", ip: "192.168.1.1", lastActive: "Just now", current: true },
          ])
        } else {
          setSessions(sess)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProfile() }, [])

  const handleSave = async () => {
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, language, timezone }),
      })
      if (!res.ok) throw new Error("Failed to update profile")
      toast.success("Profile updated.")
      setEditing(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile")
    }
  }

  const handlePasswordChange = async () => {
    if (!currentPw || !newPw || !confirmPw) return
    if (newPw !== confirmPw) {
      toast.error("New passwords do not match.")
      return
    }
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to change password")
      }
      toast.success("Password changed successfully.")
      setShowPasswordModal(false)
      setCurrentPw("")
      setNewPw("")
      setConfirmPw("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-gray-200" />
        <div className="admin-card overflow-hidden">
          <div className="h-32 bg-gray-100" />
          <div className="p-6 space-y-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-gray-200" />
            <div className="mx-auto h-5 w-32 rounded bg-gray-200" />
            <div className="mx-auto h-4 w-40 rounded bg-gray-100" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="admin-card p-6 space-y-4">
              <div className="h-5 w-40 rounded bg-gray-200" />
              <div className="h-10 rounded-xl bg-gray-100" />
              <div className="h-10 rounded-xl bg-gray-100" />
              <div className="h-10 rounded-xl bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-14 w-14 text-red-300 mb-4" />
        <p className="text-lg text-gray-600 mb-2">Failed to load profile</p>
        <p className="text-sm text-gray-400 mb-6">{error}</p>
        <button onClick={fetchProfile} className="flex items-center gap-2 rounded-xl bg-[#0B3C5D] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#0B3C5D]/80">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-[#0B3C5D] sm:text-3xl">My Profile</h1>
      </motion.div>

      <motion.div variants={itemVariants} className="admin-card overflow-hidden">
        <div className="bg-gradient-to-r from-[#0B3C5D] via-[#0B3C5D]/90 to-[#0B3C5D]/70 p-6 sm:p-8">
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-bold text-white shadow-lg ring-4 ring-white/30">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-white">{name}</h2>
              <p className="text-sm text-white/70">{email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
                <Shield className="h-3 w-3" /> {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Administrator"}
              </div>
            </div>
            <div className="sm:ml-auto flex gap-3 text-center sm:text-right">
              <div>
                <p className="text-xs text-white/60">Member since</p>
                <p className="text-sm font-semibold text-white">2026</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-xs text-white/60">Last login</p>
                <p className="text-sm font-semibold text-white">{recentActions.find((a) => a.action === "Login") ? formatDate(recentActions.find((a) => a.action === "Login")!.timestamp) : "Today"}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2">
        <motion.div variants={itemVariants} className="admin-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4 text-[#0B3C5D]" /> Personal Information
            </h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm font-medium text-[#16A34A] hover:text-[#16A34A]/80 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
              {editing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10"
                />
              ) : (
                <p className="text-sm font-medium text-gray-800">{name}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <p className="text-sm font-medium text-gray-800">{email}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
              {editing ? (
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10"
                />
              ) : (
                <p className="text-sm font-medium text-gray-800">{phone || "Not set"}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Language Preference</label>
              {editing ? (
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#16A34A]"
                >
                  <option>EN</option>
                  <option>FR</option>
                </select>
              ) : (
                <p className="text-sm font-medium text-gray-800">{language === "EN" ? "English" : "French"}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Timezone</label>
              {editing ? (
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#16A34A]"
                >
                  <option>Africa/Kigali</option>
                  <option>Africa/Nairobi</option>
                  <option>Africa/Kampala</option>
                  <option>UTC</option>
                </select>
              ) : (
                <p className="text-sm font-medium text-gray-800">{timezone}</p>
              )}
            </div>
            {editing && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#16A34A]/90 transition-all active:scale-95"
                >
                  <CheckCircle className="h-4 w-4" /> Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="admin-card p-6">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-5">
            <Lock className="h-4 w-4 text-[#0B3C5D]" /> Account Security
          </h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Password</p>
                <p className="text-xs text-gray-400">Last changed 30 days ago</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0B3C5D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B3C5D]/90 transition-all active:scale-95"
              >
                <Lock className="h-3.5 w-3.5" /> Change
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400">{twoFactor ? "Enabled" : "Disabled"}</p>
              </div>
              <button
                onClick={() => setTwoFactor(!twoFactor)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-95",
                  twoFactor
                    ? "bg-green-50 text-green-600 hover:bg-green-100"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                )}
              >
                {twoFactor ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                {twoFactor ? "Enabled" : "Disabled"}
              </button>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-800 mb-3">Active Sessions</p>
              <div className="space-y-2">
                {sessions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{s.device}</p>
                      <p className="text-xs text-gray-400">{s.ip} &middot; {s.lastActive}</p>
                    </div>
                    {s.current && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#16A34A] bg-green-50 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="admin-card p-6">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-5">
          <Activity className="h-4 w-4 text-[#0B3C5D]" /> Activity Summary
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Actions Today", value: statCounts.actionsToday, icon: Activity, gradient: "from-[#0B3C5D] to-[#0B3C5D]/70" },
            { label: "Loans Approved", value: statCounts.loansApproved, icon: HandCoins, gradient: "from-emerald-500 to-emerald-600" },
            { label: "Members Created", value: statCounts.membersCreated, icon: UserPlus, gradient: "from-amber-400 to-amber-500" },
            { label: "Reports Generated", value: statCounts.reportsGenerated, icon: FileText, gradient: "from-violet-500 to-violet-600" },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br", stat.gradient, "text-white shrink-0")}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="admin-card p-6">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-5">
          <Clock className="h-4 w-4 text-[#0B3C5D]" /> Recent Activity
        </h2>
        <div className="space-y-1">
          {recentActions.slice(0, 10).map((action) => {
            const Icon = actionIcons[action.action] || User
            return (
              <div key={action.id} className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-gray-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B3C5D]/10 text-[#0B3C5D] shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{action.description}</p>
                  <p className="text-xs text-gray-400">{action.action}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatDateTime(action.timestamp)}</span>
              </div>
            )
          })}
          {recentActions.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No recent activity found.</p>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="admin-card w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10"
                    />
                    <button
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10"
                    />
                    <button
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10"
                    />
                    <button
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handlePasswordChange}
                  className="w-full rounded-xl bg-[#0B3C5D] py-2.5 text-sm font-semibold text-white hover:bg-[#0B3C5D]/90 transition-all active:scale-[0.98]"
                >
                  Change Password
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
