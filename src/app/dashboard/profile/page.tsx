"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  User, Camera, Mail, Phone, MapPin, Calendar, Shield,
  CheckCircle, Edit2, Save, X, CreditCard, Building,
} from "lucide-react"
import { cn } from "@/lib/utils"

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

const initialMember = {
  firstName: "Jean", lastName: "Pierre", email: "jean.pierre@example.com",
  phone: "+250 788 000 000", dateOfBirth: "1990-05-15", gender: "Male",
  address: "KG 123 St, Kigali", city: "Kigali", province: "Kigali City",
  membershipNumber: "IAS-2024-0042", membershipDate: "2024-01-15",
  memberType: "Regular", idNumber: "1199000512345678",
  occupation: "Teacher", employer: "Green Hills Academy",
  emergencyName: "Marie Pierre", emergencyPhone: "+250 788 111 111",
  emergencyRelation: "Spouse",
}

export default function ProfilePage() {
  const [member, setMember] = useState(initialMember)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ ...initialMember })

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      setMember({ ...form })
      setSaving(false)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 800)
  }

  function handleCancel() {
    setForm({ ...member })
    setEditing(false)
  }

  function Field({ label, value, field }: { label: string; value: string; field: string }) {
    return (
      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-400">{label}</label>
        {editing ? (
          <input value={form[field as keyof typeof form]} onChange={(e) => handleChange(field, e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10" />
        ) : (
          <p className="text-sm font-medium text-slate-800">{value || "-"}</p>
        )}
      </div>
    )
  }

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
                {member.firstName[0]}{member.lastName[0]}
              </div>
              {editing && (
                <button className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-white p-1.5 text-primary shadow-md transition hover:bg-primary hover:text-white">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="font-heading text-xl font-bold text-slate-900">{member.firstName} {member.lastName}</h2>
              <p className="text-sm text-slate-500">{member.membershipNumber}</p>
              <div className="mt-2.5 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700"><Shield className="h-3 w-3" />{member.memberType}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-medium text-green-700"><Calendar className="h-3 w-3" />Since {member.membershipDate}</span>
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
            <Field label="First Name" value={member.firstName} field="firstName" />
            <Field label="Last Name" value={member.lastName} field="lastName" />
            <Field label="Date of Birth" value={member.dateOfBirth} field="dateOfBirth" />
            <Field label="Gender" value={member.gender} field="gender" />
            <Field label="ID Number" value={member.idNumber} field="idNumber" />
            <Field label="Occupation" value={member.occupation} field="occupation" />
            <Field label="Employer" value={member.employer} field="employer" />
            <Field label="Membership Date" value={member.membershipDate} field="membershipDate" />
            <Field label="Member Type" value={member.memberType} field="memberType" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="font-heading text-base font-bold text-slate-900">Contact & Address</h3>
          </div>
          <div className="grid gap-5 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Email" value={member.email} field="email" />
            <Field label="Phone" value={member.phone} field="phone" />
            <Field label="Address" value={member.address} field="address" />
            <Field label="City" value={member.city} field="city" />
            <Field label="Province" value={member.province} field="province" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="font-heading text-base font-bold text-slate-900">Emergency Contact</h3>
          </div>
          <div className="grid gap-5 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Full Name" value={member.emergencyName} field="emergencyName" />
            <Field label="Phone" value={member.emergencyPhone} field="emergencyPhone" />
            <Field label="Relation" value={member.emergencyRelation} field="emergencyRelation" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
