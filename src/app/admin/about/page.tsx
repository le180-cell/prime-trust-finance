"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, RefreshCw, Info, Users, DollarSign, TrendingUp, Calendar } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

interface Stat {
  id: number
  label: string
  value: number
  suffix: string
  icon: string
  sortOrder: number
}

const iconOptions = [
  { value: "users", label: "Users", icon: Users },
  { value: "savings", label: "Savings", icon: DollarSign },
  { value: "recovery", label: "Recovery", icon: TrendingUp },
  { value: "calendar", label: "Calendar", icon: Calendar },
]

function getIconPreview(iconName: string, className = "h-5 w-5") {
  const found = iconOptions.find((o) => o.value === iconName)
  if (!found) return <Info className={className} />
  const Icon = found.icon
  return <Icon className={className} />
}

export default function AdminAboutPage() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetch("/api/admin/statistics")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setError("Failed to load statistics"))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(id: number, field: keyof Stat, value: string | number) {
    setStats((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  async function handleSave() {
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/admin/statistics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statistics: stats }),
      })
      if (!res.ok) { setError("Failed to save"); return }
      setSuccess("Statistics updated successfully")
      setTimeout(() => setSuccess(""), 3000)
    } catch { setError("Network error") }
    finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="admin-card p-6 animate-pulse">
            <div className="h-5 w-48 rounded bg-gray-200" />
            <div className="mt-4 h-10 w-full rounded-xl bg-gray-100" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div variants={sectionVariants} className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-[#0B3C5D] sm:text-3xl">About Page</h1>
        <p className="mt-1 text-gray-500">Manage the statistics displayed on the public About section.</p>
      </motion.div>

      <motion.div variants={sectionVariants} className="admin-card p-6">
        <h2 className="font-heading text-lg font-semibold text-[#0B3C5D] mb-5 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-[#16A34A]" />
          Trust Statistics
        </h2>

        <div className="space-y-5">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              variants={itemVariants}
              className="rounded-xl border border-gray-100 bg-white/50 p-5 transition-all hover:border-gray-200 hover:shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#16A34A]/10 text-[#16A34A]">
                  {getIconPreview(stat.icon)}
                </div>
                <span className="text-sm font-medium text-gray-400">Stat #{index + 1}</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                  <input
                    value={stat.label}
                    onChange={(e) => handleChange(stat.id, "label", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                  <input
                    type="number"
                    value={stat.value}
                    onChange={(e) => handleChange(stat.id, "value", Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Suffix</label>
                  <input
                    value={stat.suffix}
                    onChange={(e) => handleChange(stat.id, "suffix", e.target.value)}
                    placeholder="e.g. +, %, B+ RWF"
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                  <select
                    value={stat.icon}
                    onChange={(e) => handleChange(stat.id, "icon", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl bg-red-50/80 px-5 py-3 text-sm text-red-600">
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl bg-green-50/80 px-5 py-3 text-sm text-green-600">
            {success}
          </motion.div>
        )}

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-8 py-3 font-semibold text-white transition-all hover:bg-[#16A34A]/80 disabled:opacity-60 shadow-sm"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
