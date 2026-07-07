"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Sun, Moon, Bell, ChevronDown, X,
  Landmark, PiggyBank, Sparkles, LogOut, User, Globe,
  LayoutDashboard, ArrowLeftRight, Gavel, FileText, Activity,
  CalendarDays, LifeBuoy, Receipt, Wallet, Settings,
} from "lucide-react"
import Link from "next/link"
import Sidebar from "@/components/dashboard/Sidebar"
import { useTheme } from "@/contexts/ThemeContext"
import { useLanguage } from "@/contexts/LanguageContext"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/savings": "My Savings",
  "/dashboard/loans": "My Loans",
  "/dashboard/loan-applications": "Loan Applications",
  "/dashboard/payments": "My Payments",
  "/dashboard/receivables": "My Receivables",
  "/dashboard/penalties": "Penalties",
  "/dashboard/wallet": "Digital Wallet",
  "/dashboard/statements": "Statements",
  "/dashboard/activities": "Activities",
  "/dashboard/notifications": "Notifications",
  "/dashboard/support": "Support",
  "/dashboard/profile": "Profile",
  "/dashboard/settings": "Settings",
  "/dashboard/calendar": "Calendar",
}

const pageIcons: Record<string, React.FC<{ className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/dashboard/savings": PiggyBank,
  "/dashboard/loans": Landmark,
  "/dashboard/loan-applications": FileText,
  "/dashboard/payments": ArrowLeftRight,
  "/dashboard/receivables": Receipt,
  "/dashboard/penalties": Gavel,
  "/dashboard/wallet": Wallet,
  "/dashboard/statements": FileText,
  "/dashboard/activities": Activity,
  "/dashboard/notifications": Bell,
  "/dashboard/support": LifeBuoy,
  "/dashboard/profile": User,
  "/dashboard/settings": Settings,
  "/dashboard/calendar": CalendarDays,
}

function getGreeting(t: { greeting: string; greetingAfternoon: string; greetingEvening: string }) {
  const h = new Date().getHours()
  if (h < 12) return t.greeting
  if (h < 17) return t.greetingAfternoon
  return t.greetingEvening
}

function getCurrentDate() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { t, locale, setLocale, localeNames } = useLanguage()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [user, setUser] = useState<{
    firstName: string; lastName: string; fullName: string; email: string; profilePhoto: string | null
  } | null>(null)
  const [notifications, setNotifications] = useState<Array<{
    id: number; type: string; title: string; message: string; read: boolean; createdAt: string
  }>>([])

  useEffect(() => {
    fetch("/api/dashboard/user")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user) })
      .catch(() => {})
  }, [])

  const loadNotifications = () => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.notifications) setNotifications(d.notifications) })
      .catch(() => {})
  }

  useEffect(() => {
    if (notifOpen) loadNotifications()
  }, [notifOpen])

  const unreadNotifs = notifications.filter((n) => !n.read).length
  const pageTitle = pageTitles[pathname] || "Dashboard"
  const PageIcon = pageIcons[pathname] || LayoutDashboard
  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`
    : "ME"

  return (
    <div className={`min-h-screen bg-[#F8FAFC] ${theme === "dark" ? "dark" : ""}`}>
      <Sidebar />
      <div className="pl-20 transition-all duration-350 lg:pl-[264px]">
        <div className="sticky top-0 z-30 border-b border-slate-100/80 bg-white/70 shadow-[0_4px_20px_rgba(15,23,42,0.02)] backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <PageIcon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-heading text-base font-bold text-slate-900">
                  {user ? `${getGreeting(t.dashboard)}, ${user.firstName}` : pageTitle}
                </p>
                <p className="flex items-center gap-2 text-xs text-slate-400">
                  {pageTitle}
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{getCurrentDate()}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative hidden md:block">
                <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder={t.dashboard.search}
                  className="w-48 rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs outline-none transition-all focus:w-56 focus:border-primary/30 focus:bg-white focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div className="relative">
                <button onClick={() => setLangOpen((o) => !o)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                  aria-label="Switch language">
                  <Globe className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-30" onClick={() => setLangOpen(false)} />
                      <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        className="absolute right-0 top-full z-40 mt-2 w-36 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg">
                        {(["en", "fr", "rw"] as const).map((l) => (
                          <button key={l} onClick={() => { setLocale(l); setLangOpen(false) }}
                            className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-slate-50 ${
                              locale === l ? "font-semibold text-primary" : "text-slate-600"
                            }`}>
                            <span className={`h-2 w-2 rounded-full ${locale === l ? "bg-accent" : "bg-slate-200"}`} />
                            {localeNames[l]}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-primary"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setNotifOpen((s) => !s)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-primary"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                    {unreadNotifs}
                  </span>
                )}
              </button>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((s) => !s)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-[#0E4F75] text-[10px] font-bold text-white">
                    {initials}
                  </div>
                  <span className="hidden text-sm font-medium text-slate-700 sm:block">{user?.fullName || "Member"}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-30"
                        onClick={() => setProfileOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.1)]"
                      >
                        <div className="border-b border-slate-100 px-4 py-3">
                          <p className="text-sm font-semibold text-slate-900">{user?.fullName || "Member"}</p>
                          <p className="text-xs text-slate-500">{user?.email || ""}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/dashboard/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                          >
                            <User className="h-4 w-4" /> {t.dashboard.profile}
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Settings className="h-4 w-4" /> {t.dashboard.settings}
                          </Link>
                        </div>
                        <div className="border-t border-slate-100 p-2">
                          <Link
                            href="/"
                            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-500 transition hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" /> {t.dashboard.logout}
                          </Link>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {children}

        <div className="border-t border-slate-100 px-6 py-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} IAS — Ikimina Abanyamuryango Solidarity</p>
            <div className="flex items-center gap-4">
              <a href="#" className="transition hover:text-primary">Privacy</a>
              <a href="#" className="transition hover:text-primary">Terms</a>
              <Link href="/dashboard/support" className="transition hover:text-primary">Support</Link>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {notifOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setNotifOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-[400px] border-l border-slate-100 bg-white shadow-[0_0_60px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-900">{t.dashboard.notifications}</h2>
                  <p className="text-sm text-slate-500">{unreadNotifs} {t.dashboard.unread}</p>
                </div>
                <button onClick={() => setNotifOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-[10px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-y-auto" style={{ height: "calc(100% - 73px)" }}>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Bell className="mb-3 h-10 w-10 text-slate-200" />
                    <p className="text-sm font-medium text-slate-400">{t.dashboard.noNotifications}</p>
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`border-b border-slate-50 px-6 py-4 transition-colors hover:bg-slate-50 ${!n.read ? "bg-primary/[0.02]" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${
                          n.type === "payment" ? "bg-blue-50 text-blue-600" :
                          n.type === "savings" ? "bg-emerald-50 text-emerald-600" :
                          n.type === "dividend" ? "bg-amber-50 text-amber-600" :
                          "bg-slate-50 text-slate-500"
                        }`}>
                          {n.type === "payment" ? <Landmark className="h-4 w-4" /> :
                           n.type === "savings" ? <PiggyBank className="h-4 w-4" /> :
                           n.type === "dividend" ? <Sparkles className="h-4 w-4" /> :
                           <Bell className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium ${!n.read ? "text-slate-900" : "text-slate-600"}`}>{n.title}</p>
                            {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                          </div>
                          <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>
                          <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                            {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
