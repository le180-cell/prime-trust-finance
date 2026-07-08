"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronRight, Sun, Moon, Home, Info, Briefcase, HandCoins, PiggyBank, BookOpen, Newspaper, Mail } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useTheme } from "@/contexts/ThemeContext"
import { cn } from "@/lib/utils"

const navLinkHrefs = ["#home", "#about", "#services", "#loans", "#savings", "#resources", "#news", "#contact"]

const navIcons = [Home, Info, Briefcase, HandCoins, PiggyBank, BookOpen, Newspaper, Mail]

const drawerVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring" as const, damping: 28, stiffness: 300 } },
  exit: { x: "100%", transition: { type: "spring" as const, damping: 28, stiffness: 300 } },
}

export default function Navbar() {
  const { t, locale, setLocale } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("#home")

  const scrolledClass = scrolled ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)]" : "bg-transparent"
  const brandClass = scrolled ? "text-primary" : "text-white"

  const navLabels = [t.nav.home, t.nav.about, t.nav.services, t.nav.loans, t.nav.savings, t.nav.resources, t.nav.news, t.nav.contact]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024 && mobileOpen) setMobileOpen(false)
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [mobileOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  useEffect(() => {
    const onHashChange = () => setActiveSection(window.location.hash || "#home")
    const onScroll2 = () => {
      const sections = navLinkHrefs.map(h => document.querySelector(h))
      let current = "#home"
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i]
        if (el && el.getBoundingClientRect().top <= 120) { current = navLinkHrefs[i]; break }
      }
      setActiveSection(current)
    }
    window.addEventListener("hashchange", onHashChange)
    window.addEventListener("scroll", onScroll2, { passive: true })
    onScroll2()
    return () => {
      window.removeEventListener("hashchange", onHashChange)
      window.removeEventListener("scroll", onScroll2)
    }
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolledClass}`} role="banner">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8" aria-label="Main navigation">
        <a href="#home" className="flex items-center gap-2" aria-label="IAS home">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-white font-bold text-lg shadow-lg">
            <span className="text-xs leading-none">IAS</span>
          </div>
          <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${brandClass} font-heading`}>IAS</span>
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {navLabels.map((label, i) => (
            <a key={label} href={navLinkHrefs[i]}
              className={`text-sm font-medium tracking-wide transition-colors duration-300 hover:text-secondary ${scrolled ? "text-gray-700" : "text-white/90"}`}>
              {label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="relative">
            <button onClick={() => setLangOpen((o) => !o)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                scrolled ? "border-gray-200 text-gray-500 hover:bg-gray-50" : "border-white/20 text-white/80 hover:bg-white/10"
              }`} aria-label="Switch language">
              <span className="text-xs font-bold uppercase">{locale}</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-30" onClick={() => setLangOpen(false)} />
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 top-full z-40 mt-2 w-40 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg">
                    {(["en", "fr", "rw"] as const).map((l) => (
                      <button key={l} onClick={() => { setLocale(l); setLangOpen(false) }}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-slate-50 ${
                          locale === l ? "font-semibold text-primary" : "text-slate-600"
                        }`}>
                        <span className={`h-2 w-2 rounded-full ${locale === l ? "bg-accent" : "bg-slate-200"}`} />
                        {l === "en" ? "English" : l === "fr" ? "Français" : "Kinyarwanda"}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button onClick={toggleTheme}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              scrolled ? "border-gray-200 text-gray-500 hover:bg-gray-50" : "border-white/20 text-white/80 hover:bg-white/10"
            }`} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <a href="/login"
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:bg-white/10 ${
              scrolled ? "text-primary hover:bg-primary/5" : "text-white/90 hover:text-white"
            }`}>
            {t.nav.memberLogin}
          </a>
          <a href="/register" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm transition-all duration-300 hover:shadow-[0_0_25px_rgba(244,180,0,0.5)]">
            {t.nav.becomeMember}
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <button className={`relative z-[60] lg:hidden ${mobileOpen ? "text-primary" : scrolled ? "text-primary" : "text-white"}`}
          onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>
          {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[70] flex flex-col bg-white dark:bg-slate-900 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-5 dark:border-white/5">
              <a href="#home" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-white shadow-lg">
                  IAS
                </div>
                <span className="font-heading text-base font-bold text-gray-900 dark:text-white">IAS</span>
              </a>
              <button onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800"
                aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
              <nav className="space-y-0.5">
                {navLabels.map((label, i) => {
                  const isActive = activeSection === navLinkHrefs[i]
                  const Icon = navIcons[i]
                  return (
                    <a
                      key={label}
                      href={navLinkHrefs[i]}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "admin-nav-item",
                        isActive && "active"
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-primary dark:text-secondary" : "text-gray-400 dark:text-gray-500"
                      )} />
                      <span>{label}</span>
                    </a>
                  )
                })}
              </nav>

              <div className="my-6 border-t border-gray-100 dark:border-white/5" />

              <div className="space-y-3 px-1">
                <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                  Language
                </p>
                <div className="flex gap-2">
                  {(["en", "fr", "rw"] as const).map((l) => (
                    <button key={l} onClick={() => setLocale(l)}
                      className={cn(
                        "flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                        locale === l
                          ? "bg-primary text-white shadow-sm dark:bg-secondary dark:text-slate-900"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-slate-700"
                      )}>
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>

                <button onClick={toggleTheme}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800">
                  <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                  <div className={cn(
                    "flex h-6 w-10 items-center rounded-full p-0.5 transition-colors",
                    theme === "light" ? "bg-gray-300" : "bg-secondary"
                  )}>
                    <motion.div
                      animate={{ x: theme === "light" ? 0 : 16 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                      {theme === "light" ? <Moon className="h-3 w-3 text-gray-500" /> : <Sun className="h-3 w-3 text-accent" />}
                    </motion.div>
                  </div>
                </button>
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-100 px-4 py-4 dark:border-white/5">
              <div className="space-y-2.5">
                <a href="/login" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary px-6 py-3 text-sm font-semibold text-primary transition-all active:scale-[0.98] hover:bg-primary/5 dark:border-secondary dark:text-secondary dark:hover:bg-secondary/10">
                  {t.nav.memberLogin}
                </a>
                <a href="/register" onClick={() => setMobileOpen(false)}
                  className="btn-primary flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-lg active:scale-[0.98]">
                  {t.nav.becomeMember}
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
