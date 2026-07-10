"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  User, Camera, Mail, Phone, MapPin, Calendar, Shield,
  CheckCircle, Edit2, Save, X, Building, Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

interface Profile {
  id: number
  email: string
  username: string
  firstName: string
  lastName: string
  fullName: string
  phone: string
  dateOfBirth: string
  gender: string
  nationalId: string
  district: string
  sector: string
  cell: string
  village: string
  occupation: string
  employer: string
  monthlyIncome: string
  maritalStatus: string
  profilePhoto: string | null
  memberSince: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<Partial<Profile>>({})

  useEffect(() => {
    fetch("/api/dashboard/profile")
      .then((r) => { if (!r.ok) throw new Error("Unauthorized"); return r.json() })
      .then((data) => {
        setProfile(data.profile)
        setForm({ ...data.profile })
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed to save")
      const data = await res.json()
      if (data.success) {
        setProfile({ ...profile!, ...form })
        setEditing(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setError("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setForm({ ...profile! })
    setEditing(false)
  }

  function Field({ label, value, field }: { label: string; value: string; field: string }) {
    return (
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-400">{label}</label>
        {editing ? (
          <input value={form[field as keyof Profile] as string || ""} onChange={(e) => handleChange(field, e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
        ) : (
          <p className="text-sm font-medium text-slate-800">{value || "-"}</p>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6 animate-pulse">
          <div className="h-32 rounded-3xl bg-slate-100" />
          <div className="h-48 rounded-2xl bg-slate-50" />
          <div className="h-64 rounded-2xl bg-slate-50" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl text-center py-20">
          <User className="mx-auto h-12 w-12 text-slate-200" />
          <p className="mt-4 text-sm font-medium text-slate-400">{error || "Could not load profile"}</p>
        </div>
      </div>
    )
  }

  const memberId = `IAS-${profile.firstName.slice(0, 2).toUpperCase()}${profile.lastName.slice(0, 2).toUpperCase()}-${String(profile.id).padStart(4, "0")}`

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0E4F75] to-[#06263C] p-6 text-white shadow-[0_24px_60px_rgba(11,60,93,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.14),transparent_26%)]" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10"><User className="h-6 w-6 text-accent" /></div>
            <div>
              <h1 className="font-heading text-2xl font-bold sm:text-3xl">My Profile</h1>
              <p className="text-sm text-white/65">Manage your personal information</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="relative flex flex-col items-center px-6 pb-6 pt-16 sm:flex-row sm:items-start sm:gap-6 sm:pt-8">
            <div className="relative mb-4 sm:mb-0">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#0E4F75] text-3xl font-bold text-white shadow-[0_8px_24px_rgba(11,60,93,0.2)]">
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
              {editing && (
                <button className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-white p-1.5 text-primary shadow-md transition hover:bg-primary hover:text-white">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="font-heading text-xl font-bold text-slate-900">{profile.firstName} {profile.lastName}</h2>
              <p className="text-sm text-slate-500">{memberId}</p>
              <div className="mt-2.5 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700"><Shield className="h-3 w-3" />Regular</span>
                {profile.memberSince && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-medium text-green-700"><Calendar className="h-3 w-3" />Since {profile.memberSince}</span>
                )}
              </div>
            </div>
            <div className="absolute right-6 top-6">
              {saved && <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle className="h-3.5 w-3.5" /> Saved</span>}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="font-heading text-base font-bold text-slate-900">Personal Information</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"><X className="h-3.5 w-3.5" /> Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(11,60,93,0.2)] transition hover:-translate-y-0.5 disabled:opacity-50">
                  {saving ? "Saving..." : <><Save className="h-3.5 w-3.5" /> Save</>}
                </button>
              </div>
            )}
          </div>
          <div className="grid gap-5 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="First Name" value={profile.firstName} field="firstName" />
            <Field label="Last Name" value={profile.lastName} field="lastName" />
            <Field label="Date of Birth" value={profile.dateOfBirth} field="dateOfBirth" />
            <Field label="Gender" value={profile.gender} field="gender" />
            <Field label="National ID" value={profile.nationalId} field="nationalId" />
            <Field label="Occupation" value={profile.occupation} field="occupation" />
            <Field label="Employer" value={profile.employer} field="employer" />
            <Field label="Monthly Income" value={profile.monthlyIncome} field="monthlyIncome" />
            <Field label="Marital Status" value={profile.maritalStatus} field="maritalStatus" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="font-heading text-base font-bold text-slate-900">Contact & Address</h3>
          </div>
          <div className="grid gap-5 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Email" value={profile.email} field="email" />
            <Field label="Phone" value={profile.phone} field="phone" />
            <Field label="District" value={profile.district} field="district" />
            <Field label="Sector" value={profile.sector} field="sector" />
            <Field label="Cell" value={profile.cell} field="cell" />
            <Field label="Village" value={profile.village} field="village" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
