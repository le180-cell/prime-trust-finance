"use client"

import { useEffect, useCallback } from "react"
import { Command } from "cmdk"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard, Users, HandCoins, ClipboardCheck, BarChart3, Settings,
  UserPlus, FileText, Download, Search, ArrowLeftRight,
} from "lucide-react"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const groups = [
  {
    heading: "Pages",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
      { label: "Members", icon: Users, href: "/admin/members" },
      { label: "Loans", icon: HandCoins, href: "/admin/loans" },
      { label: "Approvals", icon: ClipboardCheck, href: "/admin/approvals" },
      { label: "Reports", icon: BarChart3, href: "/admin/reports" },
      { label: "Settings", icon: Settings, href: "/admin/settings" },
    ],
  },
  {
    heading: "Actions",
    items: [
      { label: "Create Member", icon: UserPlus },
      { label: "New Loan", icon: HandCoins },
      { label: "Generate Report", icon: FileText },
      { label: "Export Data", icon: Download },
    ],
  },
  {
    heading: "Quick Search",
    items: [
      { label: "Search Members", icon: Search },
      { label: "Search Loans", icon: HandCoins },
      { label: "Search Transactions", icon: ArrowLeftRight },
    ],
  },
]

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      onOpenChange(!open)
    }
  }, [open, onOpenChange])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl rounded-2xl border border-gray-100 bg-white shadow-2xl dark:bg-slate-900 dark:border-white/5 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Command label="Command Palette" shouldFilter={true}>
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 px-4">
                <Search className="h-4 w-4 shrink-0 text-gray-400" />
                <Command.Input
                  placeholder="Type a command or search..."
                  className="flex-1 h-12 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
                />
              </div>
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  No results found.
                </Command.Empty>
                {groups.map((group) => (
                  <Command.Group key={group.heading} heading={group.heading}>
                    {group.items.map((item) => (
                      <Command.Item
                        key={item.label}
                        onSelect={() => {
                          onOpenChange(false)
                          if ("href" in item && item.href) router.push(item.href)
                        }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 aria-selected:bg-gray-50 aria-selected:text-gray-900 dark:text-gray-400 dark:aria-selected:bg-slate-800 dark:aria-selected:text-white cursor-pointer transition-colors"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
              <div className="border-t border-gray-100 dark:border-white/5 px-4 py-2 flex items-center gap-4 text-[10px] text-gray-400">
                <span><kbd className="rounded border border-gray-200 dark:border-white/10 px-1.5 py-0.5 text-[10px]">↑↓</kbd> Navigate</span>
                <span><kbd className="rounded border border-gray-200 dark:border-white/10 px-1.5 py-0.5 text-[10px]">↵</kbd> Open</span>
                <span><kbd className="rounded border border-gray-200 dark:border-white/10 px-1.5 py-0.5 text-[10px]">Esc</kbd> Close</span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
