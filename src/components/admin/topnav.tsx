"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Bell, Sun, Moon, Languages, User, Settings, LogOut, Menu,
} from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import { useLanguage } from "@/contexts/LanguageContext"

interface TopnavProps {
  onSearchOpen: () => void
  onToggleSidebar?: () => void
}

export default function Topnav({ onSearchOpen, onToggleSidebar }: TopnavProps) {
  const { theme, toggleTheme } = useTheme()
  const { locale, setLocale, localeNames, t } = useLanguage()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-12 lg:h-16 items-center justify-between gap-2 border-b border-gray-100 bg-white/95 backdrop-blur-xl px-2 sm:px-4 lg:px-6 dark:bg-slate-900/95 dark:border-white/5">
      <div className="flex items-center gap-1.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden dark:hover:bg-slate-800 active:scale-95 transition-all"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold text-gray-900 dark:text-white lg:hidden truncate">IAS Admin</span>
        <div className="hidden lg:block min-w-0">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            Admin Dashboard
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
            {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date())}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          onClick={onSearchOpen}
          className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-300 transition-all"
        >
          <Search className="h-4 w-4" />
        </button>

        <div className="relative">
          <button
            ref={notifRef}
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-300 transition-all active:scale-95"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute -top-px -right-px flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
              3
            </span>
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-64 sm:w-72 rounded-2xl border border-gray-100 bg-white shadow-lg dark:bg-slate-900 dark:border-white/5 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.dashboard.notifications}</p>
                </div>
                <div className="p-3 text-center text-sm text-gray-400 dark:text-gray-500">
                  {t.dashboard.noNotifications}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden lg:block">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-300 transition-all"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative hidden lg:block">
          <button onClick={() => setLangOpen((o) => !o)}
            className="flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-300 transition-all">
            <Languages className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{locale.toUpperCase()}</span>
          </button>
          <AnimatePresence>
            {langOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-30" onClick={() => setLangOpen(false)} />
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute right-0 top-full z-40 mt-2 w-32 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg dark:bg-slate-900 dark:border-white/5">
                  {(["en", "fr", "rw"] as const).map((l) => (
                    <button key={l} onClick={() => { setLocale(l); setLangOpen(false) }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-gray-50 dark:hover:bg-slate-800 ${
                        locale === l ? "font-semibold text-primary" : "text-gray-600 dark:text-gray-400"
                      }`}>
                      <span className={`h-2 w-2 rounded-full ${locale === l ? "bg-primary" : "bg-gray-200 dark:bg-gray-600"}`} />
                      {localeNames[l]}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20 text-secondary text-xs font-bold hover:ring-2 hover:ring-secondary/30 transition-all active:scale-95"
          >
            A
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 sm:w-56 rounded-2xl border border-gray-100 bg-white shadow-lg dark:bg-slate-900 dark:border-white/5 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Admin</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">admin@ias.rw</p>
                </div>
                <div className="p-1.5">
                  {[
                    { icon: User, label: t.dashboard.profile, href: "/admin/profile" },
                    { icon: Settings, label: t.dashboard.settings, href: "/admin/settings" },
                    { icon: LogOut, label: t.dashboard.logout, href: "/api/auth/logout" },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.href || "#"}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors active:scale-[0.98]"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
