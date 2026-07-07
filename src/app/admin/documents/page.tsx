"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, Search, Upload, Download, Eye, Trash2, X,
  FileSpreadsheet, FileImage, File, FileBadge,
} from "lucide-react"
import { formatDate, cn } from "@/lib/utils"

interface Doc {
  id: number
  name: string
  type: string
  memberName: string
  uploadDate: string
  fileSize: string
  status: string
  category: string
}

const mockDocuments: Doc[] = [
  { id: 1, name: "Loan Application - John D.pdf", type: "PDF", memberName: "John Doe", uploadDate: "2026-06-28T10:00:00", fileSize: "2.4 MB", status: "Verified", category: "Applications" },
  { id: 2, name: "National ID - Jane S.png", type: "Image", memberName: "Jane Smith", uploadDate: "2026-06-27T14:30:00", fileSize: "1.1 MB", status: "Pending", category: "IDs" },
  { id: 3, name: "Employment Contract.pdf", type: "PDF", memberName: "Alice M.", uploadDate: "2026-06-25T09:15:00", fileSize: "3.2 MB", status: "Verified", category: "Contracts" },
  { id: 4, name: "Bank Statement - June.xlsx", type: "Excel", memberName: "Bob K.", uploadDate: "2026-06-24T16:45:00", fileSize: "856 KB", status: "Pending", category: "Statements" },
  { id: 5, name: "Membership Form - Carol.pdf", type: "PDF", memberName: "Carol W.", uploadDate: "2026-06-22T11:20:00", fileSize: "1.8 MB", status: "Verified", category: "Applications" },
  { id: 6, name: "Passport - David R.jpg", type: "Image", memberName: "David R.", uploadDate: "2026-06-20T08:00:00", fileSize: "2.1 MB", status: "Rejected", category: "IDs" },
]

const categories = ["All", "Applications", "IDs", "Contracts", "Statements"]
const memberNames = ["John Doe", "Jane Smith", "Alice M.", "Bob K.", "Carol W.", "David R.", "Eve L."]

const typeIcon: Record<string, typeof FileText> = {
  PDF: FileText, Image: FileImage, Excel: FileSpreadsheet, Word: FileBadge,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function DocumentsPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [showUpload, setShowUpload] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [uploadData, setUploadData] = useState({ name: "", type: "Application", member: "" })
  const [documents, setDocuments] = useState<Doc[]>(mockDocuments)
  const [loading] = useState(false)

  const filtered = documents.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.memberName.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "All" || d.category === filter
    return matchSearch && matchFilter
  })

  const handleUpload = async () => {
    if (!uploadData.name || !uploadData.member) return
    const newDoc: Doc = {
      id: Date.now(),
      name: uploadData.name,
      type: uploadData.name.split(".").pop()?.toUpperCase() === "PDF" ? "PDF" : "Image",
      memberName: uploadData.member,
      uploadDate: new Date().toISOString(),
      fileSize: "0 KB",
      status: "Pending",
      category: uploadData.type,
    }
    setDocuments((prev) => [newDoc, ...prev])
    setShowUpload(false)
    setUploadData({ name: "", type: "Application", member: "" })
  }

  const handleDelete = (id: number) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    setDeleteId(null)
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-gray-200" />
        <div className="h-4 w-56 rounded bg-gray-100" />
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-9 w-24 rounded-xl bg-gray-100" />)}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="admin-card p-5">
              <div className="h-12 w-12 rounded-xl bg-gray-100" />
              <div className="mt-3 h-5 w-40 rounded bg-gray-200" />
              <div className="mt-1 h-3 w-32 rounded bg-gray-100" />
              <div className="mt-2 h-3 w-24 rounded bg-gray-100" />
              <div className="mt-4 flex gap-2">
                <div className="h-8 w-16 rounded-lg bg-gray-100" />
                <div className="h-8 w-16 rounded-lg bg-gray-100" />
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
          <h1 className="font-heading text-2xl font-bold text-[#0B3C5D] sm:text-3xl">Documents</h1>
          <p className="mt-1 text-gray-500">{documents.length} documents uploaded</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#16A34A]/80 shadow-sm"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents or member name..."
            className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-all",
                filter === cat
                  ? "bg-[#0B3C5D] text-white shadow-sm"
                  : "bg-white/80 border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={itemVariants} className="admin-card p-14 text-center">
          <FileText className="mx-auto h-14 w-14 text-gray-300" />
          <p className="mt-4 text-gray-500 text-lg">No documents uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">Upload your first document to get started.</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((doc, i) => {
              const Icon = typeIcon[doc.type] || File
              return (
                <motion.div
                  key={doc.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  layout
                  className="admin-card group p-5 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B3C5D]/5 text-[#0B3C5D]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      doc.status === "Verified" ? "bg-green-50 text-green-700" : doc.status === "Rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
                    )}>
                      {doc.status}
                    </span>
                  </div>
                  <p className="mt-3 font-medium text-gray-800 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.memberName}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    <span>{doc.category}</span>
                    <span>{doc.fileSize}</span>
                    <span>{formatDate(doc.uploadDate)}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50">
                      <Eye className="h-3 w-3" /> View
                    </button>
                    <button className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50">
                      <Download className="h-3 w-3" /> Download
                    </button>
                    <button
                      onClick={() => setDeleteId(doc.id)}
                      className="ml-auto flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition-all hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {deleteId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="admin-card p-6 w-full max-w-sm mx-4"
            >
              <h3 className="font-heading font-semibold text-gray-900 mb-2">Delete Document?</h3>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => handleDelete(deleteId)} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-all">Delete</button>
                <button onClick={() => setDeleteId(null)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUpload && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowUpload(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
            >
              <div className="admin-card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-heading text-lg font-semibold text-[#0B3C5D]">Upload Document</h2>
                  <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center transition-all hover:border-[#16A34A] hover:bg-[#16A34A]/5">
                    <Upload className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">Drag & drop or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG, Excel up to 10MB</p>
                    <button className="mt-3 rounded-xl bg-[#0B3C5D] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#0B3C5D]/80">Browse Files</button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Document Name</label>
                    <input value={uploadData.name} onChange={(e) => setUploadData((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Loan Application.pdf" className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Document Type</label>
                    <select value={uploadData.type} onChange={(e) => setUploadData((p) => ({ ...p, type: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all">
                      <option>Application</option>
                      <option>ID</option>
                      <option>Contract</option>
                      <option>Statement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Member</label>
                    <select value={uploadData.member} onChange={(e) => setUploadData((p) => ({ ...p, member: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all">
                      <option value="">Select member...</option>
                      {memberNames.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={!uploadData.name || !uploadData.member}
                    className="w-full rounded-xl bg-[#16A34A] py-3 font-semibold text-white transition-all hover:bg-[#16A34A]/80 disabled:opacity-60"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
