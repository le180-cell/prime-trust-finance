"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Save, Shield, Eye, EyeOff, AlertTriangle, Bell, Lock,
  Globe, RefreshCw, ToggleLeft, ToggleRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

const features = [
  { id: "autoBackup", label: "Auto Backup", desc: "Daily automatic database backup" },
  { id: "emailAlerts", label: "Email Alerts", desc: "Send email notifications for key events" },
  { id: "smsNotify", label: "SMS Notifications", desc: "Push SMS alerts to members" },
  { id: "auditLog", label: "Audit Logging", desc: "Track all admin activity" },
  { id: "maintenance", label: "Maintenance Mode", desc: "Disable public access during updates" },
]

function SkeletonSection() {
  return (
    <div className="admin-card p-6 animate-pulse space-y-4">
      <div className="h-5 w-48 rounded bg-gray-200" />
      <div className="h-24 rounded-xl bg-gray-100" />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="h-12 rounded-xl bg-gray-100" />
        <div className="h-12 rounded-xl bg-gray-100" />
      </div>
    </div>
  )
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showSecret, setShowSecret] = useState(false)

  const [mode, setMode] = useState("simulation")
  const [bankName, setBankName] = useState("")
  const [baseUrl, setBaseUrl] = useState("")
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")

  const [featureToggles, setFeatureToggles] = useState<Record<string, boolean>>({
    autoBackup: true, emailAlerts: true, smsNotify: true, auditLog: true, maintenance: false,
  })



  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => {
        if (r.status === 403) { router.push("/login"); return null }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        setMode(data.bank_api_mode || "simulation")
        setBankName(data.bank_name || "")
        setBaseUrl(data.bank_api_base_url || "")
        setClientId(data.bank_api_client_id || "")
        setClientSecret(data.bank_api_client_secret || "")
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false))
  }, [router])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_api_mode: mode,
          bank_name: bankName,
          bank_api_base_url: baseUrl,
          bank_api_client_id: clientId,
          bank_api_client_secret: clientSecret,
        }),
      })
      if (!res.ok) { setError("Failed to save."); return }
      setSuccess("Settings saved successfully.")
      setTimeout(() => setSuccess(""), 3000)
    } catch { setError("Network error.") }
    finally { setSaving(false) }
  }

  if (loading) {
    return (
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div className="mb-8" variants={sectionVariants}>
          <div className="h-8 w-72 rounded bg-gray-200 animate-pulse" />
          <div className="mt-2 h-4 w-96 rounded bg-gray-100 animate-pulse" />
        </motion.div>
        <div className="space-y-6">
          <SkeletonSection />
          <SkeletonSection />
          <SkeletonSection />
          <SkeletonSection />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div className="mb-8" variants={sectionVariants}>
        <h1 className="font-heading text-2xl font-bold text-[#0B3C5D] sm:text-3xl">Settings</h1>
        <p className="mt-1 text-gray-500">Configure your bank API connection and platform preferences.</p>
      </motion.div>

      <form onSubmit={handleSave} className="space-y-6">
        <motion.div variants={sectionVariants} className="admin-card p-6 transition-all hover:shadow-md">
          <h2 className="font-heading text-lg font-semibold text-[#0B3C5D] mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#16A34A]" />
            Operation Mode
          </h2>
          <div className="flex gap-4">
            <label className={cn(
              "flex-1 cursor-pointer rounded-xl border-2 p-5 transition-all",
              mode === "simulation" ? "border-[#16A34A] bg-[#16A34A]/5 shadow-sm" : "border-gray-200 bg-white/40 hover:bg-white/60 hover:border-gray-300"
            )}>
              <input type="radio" name="mode" value="simulation" checked={mode === "simulation"} onChange={(e) => setMode(e.target.value)} className="sr-only" />
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="h-4 w-4 text-[#16A34A]" />
                <p className="font-heading font-semibold text-[#0B3C5D]">Simulation Mode</p>
              </div>
              <p className="text-sm text-gray-500">Use fake data for testing. No real bank connection.</p>
            </label>
            <label className={cn(
              "flex-1 cursor-pointer rounded-xl border-2 p-5 transition-all",
              mode === "live" ? "border-[#16A34A] bg-[#16A34A]/5 shadow-sm" : "border-gray-200 bg-white/40 hover:bg-white/60 hover:border-gray-300"
            )}>
              <input type="radio" name="mode" value="live" checked={mode === "live"} onChange={(e) => setMode(e.target.value)} className="sr-only" />
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-4 w-4 text-[#16A34A]" />
                <p className="font-heading font-semibold text-[#0B3C5D]">Live Mode</p>
              </div>
              <p className="text-sm text-gray-500">Connect to real bank API. Requires valid credentials below.</p>
            </label>
          </div>
          {mode === "live" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 flex items-start gap-2 rounded-xl bg-[#F4B400]/10 p-4 text-sm text-[#B8860B] overflow-hidden"
            >
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>Live mode will attempt real API calls. Ensure your bank credentials are correct and your server IP is whitelisted by the bank.</span>
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={sectionVariants} className="admin-card p-6 transition-all hover:shadow-md">
          <h2 className="font-heading text-lg font-semibold text-[#0B3C5D] mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#16A34A]" />
            Bank API Credentials
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Bank Name</label>
              <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Bank of Kigali" className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">API Base URL</label>
              <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.bankofkigali.com/v1" className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Client ID</label>
              <input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Your API client ID" className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Client Secret</label>
              <div className="relative">
                <input type={showSecret ? "text" : "password"} value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} placeholder="Your API client secret" className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
                <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="admin-card p-6 transition-all hover:shadow-md">
          <h2 className="font-heading text-lg font-semibold text-[#0B3C5D] mb-4 flex items-center gap-2">
            <ToggleRight className="h-5 w-5 text-[#16A34A]" />
            Feature Toggles
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feat) => (
              <div key={feat.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white/50 p-4 transition-all hover:bg-white/80">
                <div>
                  <p className="text-sm font-medium text-gray-800">{feat.label}</p>
                  <p className="text-xs text-gray-400">{feat.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeatureToggles((prev) => ({ ...prev, [feat.id]: !prev[feat.id] }))}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                    featureToggles[feat.id] ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-gray-100 text-gray-500"
                  )}
                >
                  {featureToggles[feat.id] ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  {featureToggles[feat.id] ? "Enabled" : "Disabled"}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="admin-card p-6 transition-all hover:shadow-md">
          <h2 className="font-heading text-lg font-semibold text-[#0B3C5D] mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#16A34A]" />
            API Endpoints (optional)
          </h2>
          <p className="text-sm text-gray-500 mb-4">If your bank uses different endpoints than the defaults, specify them here.</p>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Account Verification</label>
              <input placeholder="/accounts/verify" className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-400 outline-none cursor-not-allowed" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Balance Inquiry</label>
              <input placeholder="/accounts/balance" className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-400 outline-none cursor-not-allowed" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Transaction History</label>
              <input placeholder="/accounts/transactions" className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-400 outline-none cursor-not-allowed" disabled />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Custom endpoint paths will be available once a bank partner is confirmed.</p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-100 px-5 py-3 text-sm text-red-600">
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-green-50/80 backdrop-blur-sm border border-green-100 px-5 py-3 text-sm text-green-600">
            {success}
          </motion.div>
        )}

        <motion.div variants={sectionVariants} className="flex gap-4">
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-8 py-3 font-semibold text-white transition-all hover:bg-[#16A34A]/80 disabled:opacity-60 shadow-sm">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </motion.div>
      </form>
    </motion.div>
  )
}
