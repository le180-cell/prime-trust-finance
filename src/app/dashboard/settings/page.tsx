"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Settings, Bell, Shield, Eye, Globe, Moon, Sun,
  Lock, Smartphone, Mail, MessageSquare, ToggleLeft,
  CheckCircle, ChevronRight, Clock, Building2, Plus, X, Trash2, Banknote,
} from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

interface BankAccount { id: number; bankName: string; accountName: string; accountNumber: string; accountType: string; balance: number }

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState("English")
  const [notifications, setNotifications] = useState({
    email: true, sms: true, push: false, paymentAlerts: true,
    loanUpdates: true, marketing: false,
  })
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessionExpiry, setSessionExpiry] = useState("30min")
  const [savedSection, setSavedSection] = useState<string | null>(null)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [showAddBank, setShowAddBank] = useState(false)
  const [bankForm, setBankForm] = useState({ bankName: "", accountName: "", accountNumber: "", accountType: "checking" })
  const [bankLoading, setBankLoading] = useState(false)

  const loadBankAccounts = () => {
    fetch("/api/bank-accounts")
      .then(r => r.json())
      .then((data) => { if (Array.isArray(data)) setBankAccounts(data) })
      .catch(() => {})
  }

  useEffect(loadBankAccounts, [])

  const addBankAccount = async () => {
    if (!bankForm.bankName || !bankForm.accountName || !bankForm.accountNumber) return
    setBankLoading(true)
    try {
      const res = await fetch("/api/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bankForm),
      })
      if (res.ok) { setShowAddBank(false); setBankForm({ bankName: "", accountName: "", accountNumber: "", accountType: "checking" }); loadBankAccounts() }
    } catch {}
    finally { setBankLoading(false) }
  }

  function toggle(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
    setSavedSection(key)
    setTimeout(() => setSavedSection(null), 2000)
  }

  function SettingToggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: () => void }) {
    return (
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
        <button onClick={onChange} className={cn("relative h-6 w-11 rounded-full transition-all", checked ? "bg-primary" : "bg-slate-200")}>
          <motion.div animate={{ x: checked ? 22 : 2 }} className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md" />
        </button>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0E4F75] to-[#06263C] p-6 text-white shadow-[0_24px_60px_rgba(11,60,93,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.14),transparent_26%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10"><Settings className="h-6 w-6 text-accent" /></div>
              <div>
                <h1 className="font-heading text-2xl font-bold sm:text-3xl">Settings</h1>
                <p className="text-sm text-white/65">Customize your experience</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600"><Globe className="h-5 w-5" /></div>
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900">Preferences</h3>
              <p className="text-xs text-slate-500">Language and display options</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Sun className="h-4 w-4 text-slate-400" />
                <p className="text-sm font-medium text-slate-800">Dark Mode</p>
              </div>
              <button onClick={() => setDarkMode(!darkMode)} className={cn("relative h-6 w-11 rounded-full transition-all", darkMode ? "bg-primary" : "bg-slate-200")}>
                <motion.div animate={{ x: darkMode ? 22 : 2 }} className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md" />
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-slate-400" />
                <p className="text-sm font-medium text-slate-800">Language</p>
              </div>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 outline-none focus:border-primary/30">
                {["English", "Kinyarwanda", "French"].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Bell className="h-5 w-5" /></div>
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">Manage how you receive alerts</p>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            <SettingToggle label="Email Notifications" description="Receive updates via email" checked={notifications.email} onChange={() => toggle("email")} />
            <SettingToggle label="SMS Notifications" description="Get SMS for payment reminders" checked={notifications.sms} onChange={() => toggle("sms")} />
            <SettingToggle label="Push Notifications" description="Browser push alerts" checked={notifications.push} onChange={() => toggle("push")} />
            <SettingToggle label="Payment Alerts" description="Instant payment confirmations" checked={notifications.paymentAlerts} onChange={() => toggle("paymentAlerts")} />
            <SettingToggle label="Loan Updates" description="Loan application status changes" checked={notifications.loanUpdates} onChange={() => toggle("loanUpdates")} />
            <SettingToggle label="Marketing" description="Promotions and new products" checked={notifications.marketing} onChange={() => toggle("marketing")} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Building2 className="h-5 w-5" /></div>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">Linked Bank Accounts</h3>
                <p className="text-xs text-slate-500">Manage accounts for payments</p>
              </div>
            </div>
            <button onClick={() => setShowAddBank(!showAddBank)} className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5" /> Link Account
            </button>
          </div>
          {showAddBank && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} placeholder="Bank Name" className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
                <input value={bankForm.accountName} onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })} placeholder="Account Name" className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
                <input value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} placeholder="Account Number" className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
                <select value={bankForm.accountType} onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10">
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={addBankAccount} disabled={bankLoading || !bankForm.bankName || !bankForm.accountName || !bankForm.accountNumber}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 disabled:bg-slate-300">
                  {bankLoading ? "Linking..." : "Link Account"}
                </button>
                <button onClick={() => setShowAddBank(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50">Cancel</button>
              </div>
            </div>
          )}
          {bankAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Banknote className="mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">No bank accounts linked</p>
              <p className="text-xs text-slate-400">Link your bank account to pay directly from it.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bankAccounts.map((acct) => (
                <div key={acct.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Building2 className="h-4 w-4" /></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{acct.bankName}</p>
                      <p className="text-xs text-slate-500">{acct.accountName} · {acct.accountNumber}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">RWF {new Intl.NumberFormat("en-US").format(acct.balance)}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><Shield className="h-5 w-5" /></div>
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900">Security</h3>
              <p className="text-xs text-slate-500">Protect your account</p>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            <SettingToggle label="Two-Factor Authentication" description="Extra security for your account" checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Session Timeout</p>
                  <p className="text-xs text-slate-500">Auto-logout after inactivity</p>
                </div>
              </div>
              <select value={sessionExpiry} onChange={(e) => setSessionExpiry(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 outline-none focus:border-primary/30">
                <option value="15min">15 min</option>
                <option value="30min">30 min</option>
                <option value="60min">1 hour</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
