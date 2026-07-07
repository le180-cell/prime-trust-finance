"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Star, Plus, Pencil, Trash2, X, MessageSquareQuote,
  ArrowUp, ArrowDown, AlertCircle, CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface Testimonial {
  id: number; name: string; role: string; quote: string
  rating: number; sortOrder: number; createdAt: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("h-3.5 w-3.5", s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
      ))}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-56 rounded-lg bg-slate-200" />
      <div className="h-12 w-40 rounded-xl bg-slate-200" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  )
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [modal, setModal] = useState<{ open: boolean; edit?: Testimonial }>({ open: false })
  const [form, setForm] = useState({ name: "", role: "", quote: "", rating: 5, sortOrder: 0 })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true); setError("")
    fetch("/api/admin/testimonials")
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setTestimonials(d) })
      .catch(() => setError("Failed to load testimonials"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openAdd = () => {
    const maxOrder = testimonials.reduce((m, t) => Math.max(m, t.sortOrder), 0) + 1
    setForm({ name: "", role: "", quote: "", rating: 5, sortOrder: maxOrder })
    setModal({ open: true })
  }

  const openEdit = (t: Testimonial) => {
    setForm({ name: t.name, role: t.role, quote: t.quote, rating: t.rating, sortOrder: t.sortOrder })
    setModal({ open: true, edit: t })
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.quote.trim()) { toast.error("Name and quote are required"); return }
    setSaving(true)
    try {
      const url = "/api/admin/testimonials"
      const method = modal.edit ? "PUT" : "POST"
      const body = modal.edit ? { ...form, id: modal.edit.id } : form
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (data.error) { toast.error(data.error); return }
      toast.success(modal.edit ? "Testimonial updated" : "Testimonial created")
      setModal({ open: false }); load()
    } catch { toast.error("Failed to save") } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this testimonial?")) return
    try {
      const res = await fetch("/api/admin/testimonials", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
      const data = await res.json()
      if (data.error) { toast.error(data.error); return }
      toast.success("Testimonial deleted"); load()
    } catch { toast.error("Failed to delete") }
  }

  const moveUp = (index: number) => {
    if (index <= 0) return
    const updated = [...testimonials];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    updated.forEach((t, i) => { t.sortOrder = i + 1 })
    setTestimonials(updated)
    Promise.all(updated.map((t) => fetch("/api/admin/testimonials", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) })))
  }

  const moveDown = (index: number) => {
    if (index >= testimonials.length - 1) return
    const updated = [...testimonials];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    updated.forEach((t, i) => { t.sortOrder = i + 1 })
    setTestimonials(updated)
    Promise.all(updated.map((t) => fetch("/api/admin/testimonials", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) })))
  }

  if (loading) return <div className="p-6"><Skeleton /></div>

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
          <p className="mt-3 text-lg font-semibold text-slate-800">{error}</p>
          <button onClick={load} className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5">Try Again</button>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <MessageSquareQuote className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Testimonials</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage member testimonials ({testimonials.length})</p>
          </div>
        </div>
        <button onClick={openAdd} className="admin-btn-primary flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5">
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </motion.div>

      {testimonials.length === 0 ? (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 dark:bg-slate-900 dark:border-slate-700">
          <MessageSquareQuote className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-4 text-base font-semibold text-slate-600 dark:text-slate-400">No testimonials yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">Add your first testimonial to display on the homepage.</p>
          <button onClick={openAdd} className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5">
            <Plus className="mr-1.5 inline h-4 w-4" /> Add Testimonial
          </button>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-3">
          {testimonials.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="admin-card group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                {t.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</span>
                  {t.role && <span className="text-xs text-slate-400 dark:text-slate-500">· {t.role}</span>}
                </div>
                <StarDisplay rating={t.rating} />
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
              </div>
              <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveUp(i)} disabled={i === 0} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 dark:hover:bg-slate-800">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => moveDown(i)} disabled={i === testimonials.length - 1} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 dark:hover:bg-slate-800">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => openEdit(t)} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(t.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {modal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setModal({ open: false })}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                  {modal.edit ? "Edit Testimonial" : "Add Testimonial"}
                </h3>
                <button onClick={() => setModal({ open: false })} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Role / Title</label>
                  <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Quote *</label>
                  <textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} rows={4}
                    className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Rating</label>
                  <div className="mt-1.5 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setForm({ ...form, rating: s })} type="button"
                        className="rounded-lg p-1 transition hover:scale-110">
                        <Star className={cn("h-6 w-6", s <= form.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-600")} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModal({ open: false })}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:bg-slate-300 dark:disabled:bg-slate-700">
                    {saving ? "Saving..." : modal.edit ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
