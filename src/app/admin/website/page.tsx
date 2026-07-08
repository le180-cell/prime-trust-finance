"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, Globe, Layout, FileText, Info, Phone, Footprints, HelpCircle, BookOpen, Users, BarChart3, ChevronDown, Plus, Trash2, MoveUp, MoveDown, ImageIcon, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const sectionVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } } }

const tabs = [
  { id: "hero", label: "Hero", icon: Layout },
  { id: "about", label: "About", icon: Info },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "social", label: "Social Media", icon: Globe },
  { id: "footer", label: "Footer", icon: Footprints },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "services", label: "Services", icon: BookOpen },
  { id: "statistics", label: "Statistics", icon: BarChart3 },
  { id: "partners", label: "Partners", icon: Users },
  { id: "news", label: "News", icon: FileText },
]

interface CmsEntry { section: string; key: string; value: string }
interface FaqItem { id?: number; question: string; answer: string; sortOrder: number }
interface ServiceItem { id?: number; title: string; description: string; icon: string; sortOrder: number }
interface StatItem { id?: number; label: string; value: number; suffix: string; icon: string; sortOrder: number }
interface PartnerItem { id?: number; name: string; logo: string; sortOrder: number }
interface NewsItem { id?: number; title: string; slug: string; excerpt: string; content: string; image: string; published: number; date: string }

export default function AdminWebsitePage() {
  const [activeTab, setActiveTab] = useState("hero")
  const [cmsContent, setCmsContent] = useState<Record<string, Record<string, string>>>({})
  const [faqItems, setFaqItems] = useState<FaqItem[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [statistics, setStatistics] = useState<StatItem[]>([])
  const [partners, setPartners] = useState<PartnerItem[]>([])
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [cmsRes, faqRes, svcRes, statRes, partnerRes, newsRes] = await Promise.all([
        fetch("/api/admin/cms"),
        fetch("/api/admin/faq"),
        fetch("/api/admin/services"),
        fetch("/api/admin/statistics"),
        fetch("/api/admin/partners"),
        fetch("/api/admin/news"),
      ])
      if (cmsRes.ok) {
        const cms: CmsEntry[] = await cmsRes.json()
        const grouped: Record<string, Record<string, string>> = {}
        for (const item of cms) {
          if (!grouped[item.section]) grouped[item.section] = {}
          grouped[item.section][item.key] = item.value
        }
        setCmsContent(grouped)
      }
      if (faqRes.ok) setFaqItems(await faqRes.json())
      if (svcRes.ok) setServices(await svcRes.json())
      if (statRes.ok) setStatistics(await statRes.json())
      if (partnerRes.ok) setPartners(await partnerRes.json())
      if (newsRes.ok) setNewsItems(await newsRes.json())
    } catch { toast.error("Failed to load website content") }
    finally { setLoading(false) }
  }

  function setCms(section: string, key: string, value: string) {
    setCmsContent(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [key]: value },
    }))
  }

  async function saveCms() {
    setSaving(true)
    try {
      const promises: Promise<Response>[] = []
      for (const [section, keys] of Object.entries(cmsContent)) {
        for (const [key, value] of Object.entries(keys)) {
          promises.push(fetch("/api/admin/cms", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section, key, value }) }))
        }
      }
      const faqPromise = faqItems.length > 0 ? fetch("/api/admin/faq", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ faqItems }) }) : Promise.resolve()
      const svcPromise = services.length > 0 ? fetch("/api/admin/services", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ services }) }) : Promise.resolve()
      const statPromise = statistics.length > 0 ? fetch("/api/admin/statistics", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statistics }) }) : Promise.resolve()
      const partnerPromise = partners.length > 0 ? fetch("/api/admin/partners", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ partners }) }) : Promise.resolve()
      const newsPromise = newsItems.length > 0 ? fetch("/api/admin/news", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newsItems }) }) : Promise.resolve()
      await Promise.all([...promises, faqPromise, svcPromise, statPromise, partnerPromise, newsPromise])
      toast.success("All changes saved successfully")
    } catch { toast.error("Failed to save changes") }
    finally { setSaving(false) }
  }

  function renderField(label: string, section: string, key: string, multiline = false) {
    const value = cmsContent[section]?.[key] || ""
    if (multiline) {
      return (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
          <textarea value={value} onChange={(e) => setCms(section, key, e.target.value)} rows={4} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y" />
        </div>
      )
    }
    return (
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
        <input value={value} onChange={(e) => setCms(section, key, e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="admin-card p-6 animate-pulse">
            <div className="h-5 w-48 rounded bg-gray-200" />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="h-10 rounded-xl bg-gray-100" /><div className="h-10 rounded-xl bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      <motion.div variants={sectionVariants}>
        <h1 className="font-heading text-2xl font-bold text-[#0B3C5D] sm:text-3xl">Website Management</h1>
        <p className="mt-1 text-gray-500">Manage all public-facing website content from one place.</p>
      </motion.div>

      <motion.div variants={sectionVariants} className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {tabs.map((tab) => {
          const TabIcon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-medium transition-colors", activeTab === tab.id ? "bg-white text-primary shadow-sm border border-b-white border-gray-200 -mb-px" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50")}>
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </motion.div>

      <motion.div variants={sectionVariants} className="admin-card p-6">
        {activeTab === "hero" && (
          <div className="space-y-5">
            <h2 className="font-heading text-lg font-semibold text-[#0B3C5D]">Hero Section</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {renderField("Title", "hero", "title")}
              {renderField("Subtitle", "hero", "subtitle")}
              {renderField("CTA Button Text", "hero", "cta")}
              {renderField("Secondary CTA Text", "hero", "ctaSecondary")}
            </div>
            {renderField("Description", "hero", "description", true)}
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-5">
            <h2 className="font-heading text-lg font-semibold text-[#0B3C5D]">About Section</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {renderField("Title", "about", "title")}
            </div>
            {renderField("Content", "about", "content", true)}
            {renderField("Mission", "about", "mission", true)}
            {renderField("Vision", "about", "vision", true)}
          </div>
        )}

        {activeTab === "contact" && (
          <div className="space-y-5">
            <h2 className="font-heading text-lg font-semibold text-[#0B3C5D]">Contact Information</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {renderField("Address", "contact", "address")}
              {renderField("Phone", "contact", "phone")}
              {renderField("Email", "contact", "email")}
              {renderField("Business Hours", "contact", "hours")}
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <div className="space-y-5">
            <h2 className="font-heading text-lg font-semibold text-[#0B3C5D]">Social Media Links</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {renderField("Facebook URL", "social", "facebook")}
              {renderField("Twitter URL", "social", "twitter")}
              {renderField("Instagram URL", "social", "instagram")}
              {renderField("LinkedIn URL", "social", "linkedin")}
            </div>
          </div>
        )}

        {activeTab === "footer" && (
          <div className="space-y-5">
            <h2 className="font-heading text-lg font-semibold text-[#0B3C5D]">Footer Content</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {renderField("Copyright Text", "footer", "copyright")}
              {renderField("Tagline", "footer", "tagline")}
            </div>
          </div>
        )}

        {activeTab === "faq" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-[#0B3C5D]">FAQ Items</h2>
              <button onClick={() => setFaqItems(prev => [...prev, { question: "", answer: "", sortOrder: prev.length }])} className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                <Plus className="h-4 w-4" /> Add FAQ
              </button>
            </div>
            {faqItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white/50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">FAQ #{i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { const arr = [...faqItems]; if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; setFaqItems(arr) } }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><MoveUp className="h-4 w-4" /></button>
                    <button onClick={() => { const arr = [...faqItems]; if (i < arr.length - 1) { [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; setFaqItems(arr) } }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><MoveDown className="h-4 w-4" /></button>
                    <button onClick={() => setFaqItems(prev => prev.filter((_, idx) => idx !== i))} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <input value={item.question} onChange={(e) => { const arr = [...faqItems]; arr[i] = { ...arr[i], question: e.target.value }; setFaqItems(arr) }} placeholder="Question" className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                <textarea value={item.answer} onChange={(e) => { const arr = [...faqItems]; arr[i] = { ...arr[i], answer: e.target.value }; setFaqItems(arr) }} placeholder="Answer" rows={3} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y" />
              </div>
            ))}
            {faqItems.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No FAQ items yet. Click &quot;Add FAQ&quot; to create one.</p>}
          </div>
        )}

        {activeTab === "services" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-[#0B3C5D]">Services</h2>
              <button onClick={() => setServices(prev => [...prev, { title: "", description: "", icon: "savings", sortOrder: prev.length }])} className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                <Plus className="h-4 w-4" /> Add Service
              </button>
            </div>
            {services.map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white/50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">Service #{i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { const arr = [...services]; if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; setServices(arr) } }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><MoveUp className="h-4 w-4" /></button>
                    <button onClick={() => { const arr = [...services]; if (i < arr.length - 1) { [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; setServices(arr) } }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><MoveDown className="h-4 w-4" /></button>
                    <button onClick={() => setServices(prev => prev.filter((_, idx) => idx !== i))} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={item.title} onChange={(e) => { const arr = [...services]; arr[i] = { ...arr[i], title: e.target.value }; setServices(arr) }} placeholder="Title" className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                  <select value={item.icon} onChange={(e) => { const arr = [...services]; arr[i] = { ...arr[i], icon: e.target.value }; setServices(arr) }} className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                    {["savings", "loans", "emergency", "investments", "digital", "portal"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <textarea value={item.description} onChange={(e) => { const arr = [...services]; arr[i] = { ...arr[i], description: e.target.value }; setServices(arr) }} placeholder="Description" rows={2} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y" />
              </div>
            ))}
            {services.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No services yet. Click &quot;Add Service&quot; to create one.</p>}
          </div>
        )}

        {activeTab === "statistics" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-[#0B3C5D]">Trust Statistics</h2>
              <button onClick={() => setStatistics(prev => [...prev, { label: "", value: 0, suffix: "", icon: "users", sortOrder: prev.length }])} className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                <Plus className="h-4 w-4" /> Add Stat
              </button>
            </div>
            {statistics.map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white/50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">Stat #{i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setStatistics(prev => prev.filter((_, idx) => idx !== i))} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <input value={item.label} onChange={(e) => { const arr = [...statistics]; arr[i] = { ...arr[i], label: e.target.value }; setStatistics(arr) }} placeholder="Label" className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                  <input type="number" value={item.value} onChange={(e) => { const arr = [...statistics]; arr[i] = { ...arr[i], value: Number(e.target.value) }; setStatistics(arr) }} placeholder="Value" className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                  <input value={item.suffix} onChange={(e) => { const arr = [...statistics]; arr[i] = { ...arr[i], suffix: e.target.value }; setStatistics(arr) }} placeholder="Suffix (e.g. +, %)" className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                  <select value={item.icon} onChange={(e) => { const arr = [...statistics]; arr[i] = { ...arr[i], icon: e.target.value }; setStatistics(arr) }} className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                    {["users", "savings", "recovery", "calendar", "dollar-sign", "trending-up"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            ))}
            {statistics.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No statistics yet.</p>}
          </div>
        )}

        {activeTab === "partners" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-[#0B3C5D]">Partners</h2>
              <button onClick={() => setPartners(prev => [...prev, { name: "", logo: "", sortOrder: prev.length }])} className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                <Plus className="h-4 w-4" /> Add Partner
              </button>
            </div>
            {partners.map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white/50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">Partner #{i + 1}</span>
                  <button onClick={() => setPartners(prev => prev.filter((_, idx) => idx !== i))} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={item.name} onChange={(e) => { const arr = [...partners]; arr[i] = { ...arr[i], name: e.target.value }; setPartners(arr) }} placeholder="Partner Name" className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                  <input value={item.logo} onChange={(e) => { const arr = [...partners]; arr[i] = { ...arr[i], logo: e.target.value }; setPartners(arr) }} placeholder="Logo URL (optional)" className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                </div>
              </div>
            ))}
            {partners.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No partners yet.</p>}
          </div>
        )}

        {activeTab === "news" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-[#0B3C5D]">News & Articles</h2>
              <button onClick={() => setNewsItems(prev => [...prev, { title: "", slug: "", excerpt: "", content: "", image: "", published: 1, date: new Date().toISOString().split("T")[0] }])} className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                <Plus className="h-4 w-4" /> Add Article
              </button>
            </div>
            {newsItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white/50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">Article #{i + 1}</span>
                  <button onClick={() => setNewsItems(prev => prev.filter((_, idx) => idx !== i))} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={item.title} onChange={(e) => { const arr = [...newsItems]; arr[i] = { ...arr[i], title: e.target.value }; setNewsItems(arr) }} placeholder="Title" className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                  <input value={item.slug} onChange={(e) => { const arr = [...newsItems]; arr[i] = { ...arr[i], slug: e.target.value }; setNewsItems(arr) }} placeholder="Slug (e.g. my-article)" className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={item.date} type="date" onChange={(e) => { const arr = [...newsItems]; arr[i] = { ...arr[i], date: e.target.value }; setNewsItems(arr) }} className="rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="checkbox" checked={item.published === 1} onChange={(e) => { const arr = [...newsItems]; arr[i] = { ...arr[i], published: e.target.checked ? 1 : 0 }; setNewsItems(arr) }} className="rounded" />
                      Published
                    </label>
                  </div>
                </div>
                <input value={item.image} onChange={(e) => { const arr = [...newsItems]; arr[i] = { ...arr[i], image: e.target.value }; setNewsItems(arr) }} placeholder="Image URL (optional)" className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                <textarea value={item.excerpt} onChange={(e) => { const arr = [...newsItems]; arr[i] = { ...arr[i], excerpt: e.target.value }; setNewsItems(arr) }} placeholder="Excerpt" rows={2} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y" />
                <textarea value={item.content} onChange={(e) => { const arr = [...newsItems]; arr[i] = { ...arr[i], content: e.target.value }; setNewsItems(arr) }} placeholder="Full content (HTML supported)" rows={4} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y font-mono text-xs" />
              </div>
            ))}
            {newsItems.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No news articles yet.</p>}
          </div>
        )}
      </motion.div>

      <motion.div variants={sectionVariants} className="sticky bottom-0 flex items-center justify-end gap-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm px-6 py-4 -mx-6 -mb-6 rounded-b-2xl">
        <button onClick={loadAll} className="flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
        <button onClick={saveCms} disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-60 shadow-sm">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </motion.div>
    </motion.div>
  )
}