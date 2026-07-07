"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Pencil, PauseCircle, Trash2, X, Plus,
  Search, Shield, User,
} from "lucide-react"
import { cn, timeAgo } from "@/lib/utils"

interface Staff {
  id: number
  name: string
  email: string
  role: string
  department: string
  status: string
  lastActive: string
  avatar: string
}

const roles = ["Admin", "Manager", "Officer", "Viewer"]
const departments = ["Operations", "Finance", "Loans", "Compliance", "IT", "HR"]

const mockStaff: Staff[] = [
  { id: 1, name: "Admin User", email: "admin@ias.com", role: "Admin", department: "Operations", status: "Active", lastActive: new Date().toISOString(), avatar: "A" },
  { id: 2, name: "Jane Smith", email: "jane@ias.com", role: "Manager", department: "Finance", status: "Active", lastActive: new Date(Date.now() - 3600000).toISOString(), avatar: "J" },
  { id: 3, name: "John Doe", email: "john@ias.com", role: "Officer", department: "Loans", status: "Active", lastActive: new Date(Date.now() - 7200000).toISOString(), avatar: "J" },
  { id: 4, name: "Carol W.", email: "carol@ias.com", role: "Viewer", department: "Compliance", status: "Suspended", lastActive: new Date(Date.now() - 86400000 * 3).toISOString(), avatar: "C" },
  { id: 5, name: "Bob K.", email: "bob@ias.com", role: "Officer", department: "IT", status: "Active", lastActive: new Date(Date.now() - 1800000).toISOString(), avatar: "B" },
]

const permissionRoles = [
  { role: "Admin", permissions: { read: true, write: true, approve: true, delete: true, manage: true } },
  { role: "Manager", permissions: { read: true, write: true, approve: true, delete: false, manage: false } },
  { role: "Officer", permissions: { read: true, write: true, approve: false, delete: false, manage: false } },
  { role: "Viewer", permissions: { read: true, write: false, approve: false, delete: false, manage: false } },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function StaffPage() {
  const [loading] = useState(false)
  const [search, setSearch] = useState("")
  const [staff, setStaff] = useState<Staff[]>(mockStaff)
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Officer", department: "Operations" })

  const filtered = staff.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditingStaff(null)
    setForm({ name: "", email: "", password: "", role: "Officer", department: "Operations" })
    setShowModal(true)
  }

  const openEdit = (s: Staff) => {
    setEditingStaff(s)
    setForm({ name: s.name, email: s.email, password: "", role: s.role, department: s.department })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.email) return
    if (editingStaff) {
      setStaff((prev) => prev.map((s) => s.id === editingStaff.id ? { ...s, name: form.name, email: form.email, role: form.role, department: form.department } : s))
    } else {
      const newStaff: Staff = {
        id: Date.now(),
        name: form.name,
        email: form.email,
        role: form.role,
        department: form.department,
        status: "Active",
        lastActive: new Date().toISOString(),
        avatar: form.name.charAt(0).toUpperCase(),
      }
      setStaff((prev) => [...prev, newStaff])
    }
    setShowModal(false)
  }

  const toggleStatus = (id: number) => {
    setStaff((prev) => prev.map((s) => s.id === id ? { ...s, status: s.status === "Active" ? "Suspended" : "Active" } : s))
  }

  const handleDelete = (id: number) => {
    setStaff((prev) => prev.filter((s) => s.id !== id))
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-56 rounded-lg bg-gray-200" />
        <div className="h-4 w-64 rounded bg-gray-100" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="admin-card p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 w-28 rounded bg-gray-200" />
                  <div className="mt-1 h-3 w-36 rounded bg-gray-100" />
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="h-3 w-20 rounded bg-gray-100" />
                <div className="h-3 w-24 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#0B3C5D] sm:text-3xl">Staff Management</h1>
          <p className="mt-1 text-gray-500">{staff.length} staff members</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#16A34A]/80 shadow-sm">
          <Plus className="h-4 w-4" />
          Add Staff
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff by name or email..." className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={itemVariants} className="admin-card p-14 text-center">
          <Users className="mx-auto h-14 w-14 text-gray-300" />
          <p className="mt-4 text-gray-500 text-lg">No staff members</p>
          <p className="text-sm text-gray-400 mt-1">Add your first staff member to get started.</p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={containerVariants} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filtered.map((s, i) => (
                <motion.div
                  key={s.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  layout
                  className="admin-card p-5 transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0B3C5D] to-[#0B3C5D]/70 text-white text-lg font-bold shadow-sm">
                        {s.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-500 truncate">{s.email}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1",
                      s.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                    )}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", s.status === "Active" ? "bg-green-500" : "bg-red-500")} />
                      {s.status}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-[#0B3C5D]" />{s.role}</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3 text-[#0B3C5D]" />{s.department}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">Last active: {timeAgo(s.lastActive)}</p>
                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-50">
                    <button onClick={() => openEdit(s)} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50">
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button onClick={() => toggleStatus(s.id)} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50">
                      <PauseCircle className="h-3 w-3" /> {s.status === "Active" ? "Suspend" : "Activate"}
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="ml-auto flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition-all hover:bg-red-50">
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 admin-card overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-heading text-lg font-semibold text-[#0B3C5D]">Roles & Permissions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="px-6 py-3.5 text-left font-medium text-gray-500">Role</th>
                    <th className="px-6 py-3.5 text-center font-medium text-gray-500">Read</th>
                    <th className="px-6 py-3.5 text-center font-medium text-gray-500">Write</th>
                    <th className="px-6 py-3.5 text-center font-medium text-gray-500">Approve</th>
                    <th className="px-6 py-3.5 text-center font-medium text-gray-500">Delete</th>
                    <th className="px-6 py-3.5 text-center font-medium text-gray-500">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionRoles.map((pr, i) => (
                    <motion.tr
                      key={pr.role}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-gray-50 transition-all hover:bg-gray-50/50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-800">{pr.role}</td>
                      {["read", "write", "approve", "delete", "manage"].map((perm) => (
                        <td key={perm} className="px-6 py-4 text-center">
                          {pr.permissions[perm as keyof typeof pr.permissions] ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-600 text-xs font-bold">✓</span>
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-50 text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
            >
              <div className="admin-card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-heading text-lg font-semibold text-[#0B3C5D]">{editingStaff ? "Edit Staff" : "Add Staff"}</h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name</label>
                    <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="John Doe" className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="john@ias.com" className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
                  </div>
                  {!editingStaff && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
                      <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Min 8 characters" className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Role</label>
                      <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all">
                        {roles.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Department</label>
                      <select value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all">
                        {departments.map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSave} disabled={!form.name || !form.email} className="flex-1 rounded-xl bg-[#16A34A] py-3 font-semibold text-white transition-all hover:bg-[#16A34A]/80 disabled:opacity-60">
                      {editingStaff ? "Save Changes" : "Add Staff"}
                    </button>
                    <button onClick={() => setShowModal(false)} className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50">Cancel</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
