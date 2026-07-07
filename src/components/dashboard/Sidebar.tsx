"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard, Wallet, Landmark, FileText, ArrowLeftRight,
  Receipt, Gavel, Bell, LifeBuoy, User, Settings, LogOut,
  PanelLeftClose, PanelLeft, Activity, CalendarDays, PiggyBank,
  SprayCan as Coins,
} from "lucide-react"

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
  { href: "/", label: "Logout", icon: LogOut, external: true },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 264 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-100/80 bg-white/90 shadow-[0_0_40px_rgba(15,23,42,0.04)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between border-b border-slate-100/60 px-4 py-4">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#0E4F75] text-[11px] font-bold text-white shadow-lg shadow-primary/20">
              IAS
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">Member Portal</span>
              <p className="text-[10px] font-medium text-slate-400">Ikimina Abanyamuryango</p>
            </div>
          </motion.div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#0E4F75] text-[11px] font-bold text-white shadow-lg shadow-primary/20">
            IAS
          </div>
        )}
        <button
          onClick={() => setCollapsed((s) => !s)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-primary"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-3 py-3 scrollbar-thin">
        {navItems.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3">
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-100/60 px-3 py-3">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-primary/10 text-primary"
                  : item.label === "Logout"
                  ? "text-red-400 hover:bg-red-50 hover:text-red-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </div>
    </motion.aside>
  )
}
