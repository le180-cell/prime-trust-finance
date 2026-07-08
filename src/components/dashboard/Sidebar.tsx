"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, PiggyBank, Landmark, FileText, ArrowLeftRight,
  Receipt, Gavel, Wallet, Activity, Bell, LifeBuoy, CalendarDays,
  User, Settings, LogOut, Menu, ChevronLeft, X, SprayCan as Coins,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/savings", label: "My Savings", icon: PiggyBank },
  { href: "/dashboard/loans", label: "My Loans", icon: Landmark },
  { href: "/dashboard/loan-applications", label: "Loan Applications", icon: FileText },
  { href: "/dashboard/payments", label: "My Payments", icon: ArrowLeftRight },
  { href: "/dashboard/receivables", label: "My Receivables", icon: Receipt },
  { href: "/dashboard/penalties", label: "Penalties", icon: Gavel },
  { href: "/dashboard/wallet", label: "Digital Wallet", icon: Coins },
  { href: "/dashboard/statements", label: "Statements", icon: FileText },
  { href: "/dashboard/activities", label: "Activities", icon: Activity },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
]

const bottomItems = [
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  const nav = (
    <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin">
      {navItems.map((item) => {
        const active = isActive(item.href)
        const Icon = item.icon
        return (
          <div
            key={item.href}
            className="relative mb-0.5"
            onMouseEnter={() => setHoveredItem(item.href)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "admin-nav-item",
                active && "active"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 shrink-0",
                active ? "text-primary dark:text-secondary" : "text-gray-400 dark:text-gray-500"
              )} />
              <span className={cn("truncate", collapsed && "hidden")}>
                {item.label}
              </span>
            </Link>
            {collapsed && hoveredItem === item.href && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 dark:bg-slate-700 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                {item.label}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar - hidden on mobile */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col bg-white border-r border-gray-100 dark:bg-slate-900 dark:border-white/5 overflow-hidden"
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100 dark:border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">
              IAS
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-heading text-base font-bold text-gray-900 dark:text-white"
              >
                Member Portal
              </motion.span>
            )}
          </Link>
          <button
            onClick={onToggle}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-300 transition-colors"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {nav}

        <div className="border-t border-gray-100 dark:border-white/5 px-3 py-3 space-y-0.5">
          {bottomItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "admin-nav-item",
                  active && "active"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 shrink-0",
                  active ? "text-primary dark:text-secondary" : "text-gray-400 dark:text-gray-500"
                )} />
                <span className={cn("truncate", collapsed && "hidden")}>
                  {item.label}
                </span>
              </Link>
            )
          })}
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </Link>
        </div>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-white dark:bg-slate-900 shadow-2xl lg:hidden"
            >
              <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100 dark:border-white/5">
                <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onMobileClose}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">
                    IAS
                  </div>
                  <span className="font-heading text-base font-bold text-gray-900 dark:text-white">
                    Member Portal
                  </span>
                </Link>
                <button
                  onClick={onMobileClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {nav}

              <div className="border-t border-gray-100 dark:border-white/5 px-3 py-3 space-y-0.5">
                {bottomItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "admin-nav-item",
                        active && "active"
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5 shrink-0",
                        active ? "text-primary dark:text-secondary" : "text-gray-400 dark:text-gray-500"
                      )} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                <Link
                  href="/"
                  onClick={onMobileClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Logout</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
