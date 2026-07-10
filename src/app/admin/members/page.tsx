"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, UserPlus, Eye, Shield, Trash2, FileText, FileSpreadsheet,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  Users, X, LoaderCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
} from "@tanstack/react-table"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface Member {
  id: number
  email: string
  username: string | null
  role: string
  createdAt: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  district: string | null
  occupation: string | null
  memberSince: string | null
  accountCount: number
  status: string
}

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200 before:bg-green-500",
  suspended: "bg-red-50 text-red-700 border-red-200 before:bg-red-500",
  pending: "bg-amber-50 text-amber-700 border-amber-200 before:bg-amber-500",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

function SkeletonTable() {
  return (
    <div className="admin-card overflow-hidden p-5 space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="h-5 w-5 rounded bg-gray-200" />
          <div className="h-9 w-9 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-3 w-24 rounded bg-gray-100" />
          </div>
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="h-4 w-20 rounded bg-gray-100" />
          <div className="h-4 w-24 rounded bg-gray-100" />
          <div className="h-8 w-20 rounded-lg bg-gray-100" />
        </div>
      ))}
    </div>
  )
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ firstName: "", lastName: "", email: "", phone: "", district: "", occupation: "", password: "", confirmPassword: "" })
  const [addLoading, setAddLoading] = useState(false)

  const fetchMembers = useCallback(() => {
    setLoading(true)
    setError("")
    fetch("/api/admin/members")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch")
        return r.json()
      })
      .then((data) => {
        const enriched: Member[] = (data.members || []).map((m: Member) => ({
          ...m,
          status: "active",
        }))
        setMembers(enriched)
      })
      .catch(() => setError("Failed to load members"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const filtered = useMemo(() => {
    let result = members
    if (filterStatus !== "All") {
      result = result.filter((m) => m.status === filterStatus.toLowerCase())
    }
    return result
  }, [members, filterStatus])

  const handlePromote = useCallback(async (id: number) => {
    setActionLoading(id)
    try {
      const res = await fetch("/api/admin/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      })
      if (!res.ok) { toast.error("Failed to promote user"); return }
      toast.success("User promoted to admin successfully")
      fetchMembers()
    } catch { toast.error("Network error") }
    finally { setActionLoading(null) }
  }, [fetchMembers])

  const handleDelete = useCallback((id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Delete this member?</p>
        <p className="text-xs text-gray-500">This will remove all linked accounts and data.</p>
        <div className="flex gap-2 mt-1">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              setActionLoading(id)
              try {
                const res = await fetch(`/api/admin/members/${id}`, { method: "DELETE" })
                if (!res.ok) { toast.error("Failed to delete"); return }
                toast.success("Member deleted")
                fetchMembers()
              } catch { toast.error("Network error") }
              finally { setActionLoading(null) }
            }}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 8000 })
  }, [fetchMembers])

  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary/30 cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary/30 cursor-pointer"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "firstName",
        header: "Member",
        cell: ({ row }) => {
          const m = row.original
          return (
            <Link href={`/admin/members/${m.id}`} className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white text-sm font-bold shadow-sm shrink-0">
                {(m.firstName?.charAt(0) || m.email.charAt(0)).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-800 group-hover:text-primary transition-colors">
                  {m.firstName ? `${m.firstName} ${m.lastName || ""}` : "—"}
                </p>
                <p className="text-xs text-gray-400">{m.email}</p>
              </div>
            </Link>
          )
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => <span className="text-sm text-gray-600">{getValue() as string}</span>,
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }) => <span className="text-sm text-gray-600">{getValue() as string || "—"}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as string
          const colors = statusColors[status] || statusColors.pending
          return (
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium before:h-1.5 before:w-1.5 before:rounded-full",
              colors
            )}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )
        },
      },
      {
        accessorKey: "createdAt",
        header: "Member Since",
        cell: ({ getValue }) => <span className="text-sm text-gray-400">{formatDate(getValue() as string)}</span>,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const m = row.original
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Link
                href={`/admin/members/${m.id}`}
                className="flex items-center justify-center rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 hover:text-primary transition-all"
                title="View member"
              >
                <Eye className="h-3.5 w-3.5" />
              </Link>
              {m.role !== "admin" && (
                <button
                  onClick={() => handlePromote(m.id)}
                  disabled={actionLoading === m.id}
                  className="flex items-center justify-center rounded-lg border border-amber-200 p-1.5 text-amber-600 hover:bg-amber-50 transition-all disabled:opacity-50"
                  title="Promote to admin"
                >
                  <Shield className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => handleDelete(m.id)}
                disabled={actionLoading === m.id}
                className="flex items-center justify-center rounded-lg border border-red-200 p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                title="Delete member"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        },
        enableSorting: false,
      },
    ],
    [actionLoading, handlePromote, handleDelete]
  )

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, rowSelection, columnFilters, globalFilter: search },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  function handleBulkSuspend() {
    const ids = table.getSelectedRowModel().rows.map((r) => r.original.id)
    toast.success(`Suspended ${ids.length} member(s)`)
    table.resetRowSelection()
  }

  function handleBulkActivate() {
    const ids = table.getSelectedRowModel().rows.map((r) => r.original.id)
    toast.success(`Activated ${ids.length} member(s)`)
    table.resetRowSelection()
  }

  function handleBulkDelete() {
    const ids = table.getSelectedRowModel().rows.map((r) => r.original.id)
    toast.success(`Deleted ${ids.length} member(s)`)
    table.resetRowSelection()
  }

  const selectedCount = Object.keys(rowSelection).length

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={rowVariants} className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary sm:text-3xl flex items-center gap-3">
            Members
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-0.5 text-sm font-medium text-primary">
              {members.length}
            </span>
          </h1>
          <p className="mt-1 text-gray-500">Manage all registered users.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-secondary/90 shadow-sm hover:shadow-md">
          <UserPlus className="h-4 w-4" />
          Add Member
        </button>
      </motion.div>

      <motion.div variants={rowVariants} className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 pl-10 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {["All", "Active", "Suspended", "Pending"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={cn(
                "rounded-lg px-3.5 py-2 text-xs font-medium transition-all",
                filterStatus === f
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white/80 text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/10 px-4 py-2.5"
        >
          <span className="text-sm font-medium text-primary">{selectedCount} selected</span>
          <button onClick={handleBulkSuspend} className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition-all">
            Suspend Selected
          </button>
          <button onClick={handleBulkActivate} className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-white hover:bg-secondary/90 transition-all">
            Activate Selected
          </button>
          <button onClick={handleBulkDelete} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-all">
            Delete Selected
          </button>
          <button onClick={() => table.resetRowSelection()} className="ml-auto text-xs text-gray-500 hover:text-gray-700">
            Clear
          </button>
        </motion.div>
      )}

      {error && (
        <motion.div variants={rowVariants} className="mb-4 rounded-xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-600 flex items-center gap-3">
          <span>{error}</span>
          <button onClick={fetchMembers} className="ml-auto rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 transition-all">
            Retry
          </button>
        </motion.div>
      )}

      {loading ? (
        <SkeletonTable />
      ) : filtered.length === 0 ? (
        <motion.div variants={rowVariants} className="admin-card flex flex-col items-center justify-center py-16">
          <Users className="h-14 w-14 text-gray-300" />
          <p className="mt-4 text-lg font-medium text-gray-500">No members found</p>
          <p className="mt-1 text-sm text-gray-400">Try adjusting your search or filters.</p>
        </motion.div>
      ) : (
        <motion.div variants={rowVariants} className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-gray-100 bg-gray-50/50">
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className={cn(
                          "px-4 py-3.5 text-left font-medium text-gray-500",
                          header.column.getCanSort() && "cursor-pointer select-none hover:text-gray-700"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1.5">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            { asc: <ArrowUp className="h-3.5 w-3.5" />, desc: <ArrowDown className="h-3.5 w-3.5" /> }[header.column.getIsSorted() as string] ?? <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "border-b border-gray-50 transition-all",
                      row.getIsSelected() ? "bg-primary/[0.02]" : "hover:bg-gray-50/50"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <div className="text-sm text-gray-500">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div variants={rowVariants} className="mt-5 flex items-center gap-3">
        <button onClick={() => alert("Export PDF clicked")} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 shadow-sm">
          <FileText className="h-4 w-4" />
          Export PDF
        </button>
        <button onClick={() => alert("Export Excel clicked")} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 shadow-sm">
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </button>
      </motion.div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Add Member</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Create a new member account</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault()
                if (addForm.password.length < 6) { toast.error("Password must be at least 6 characters"); return }
                if (addForm.password !== addForm.confirmPassword) { toast.error("Passwords do not match"); return }
                setAddLoading(true)
                try {
                  const res = await fetch("/api/admin/members", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(addForm),
                  })
                  const data = await res.json()
                  if (!res.ok) { toast.error(data.error || "Failed to create member"); return }
                  toast.success("Member created successfully")
                  setShowAddModal(false)
                  setAddForm({ firstName: "", lastName: "", email: "", phone: "", district: "", occupation: "", password: "", confirmPassword: "" })
                  fetchMembers()
                } catch { toast.error("Network error") }
                finally { setAddLoading(false) }
              }} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
                    <input required value={addForm.firstName} onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                    <input value={addForm.lastName} onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <input required type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" placeholder="member@example.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" placeholder="+250 7XX XXX XXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">District</label>
                    <input value={addForm.district} onChange={(e) => setAddForm({ ...addForm, district: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" placeholder="Kigali" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Occupation</label>
                  <input value={addForm.occupation} onChange={(e) => setAddForm({ ...addForm, occupation: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" placeholder="Teacher" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                    <input required type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" placeholder="Min 6 characters" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
                    <input required type="password" value={addForm.confirmPassword} onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10" placeholder="Repeat password" />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={addLoading} className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-secondary/90 disabled:opacity-60 shadow-sm">
                    {addLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    {addLoading ? "Creating..." : "Create Member"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
