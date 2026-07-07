"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronRight, Globe, Sun, Moon } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useTheme } from "@/contexts/ThemeContext"

const navLinkHrefs = ["#home", "#about", "#services", "#loans", "#savings", "#resources", "#news", "#contact"]

export default function Navbar() {
  const { t, locale, setLocale, locales, localeNames } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const scrolledClass = scrolled ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)]" : "bg-transparent"
  const textClass = scrolled ? "text-gray-700" : "text-white/90"
  const brandClass = scrolled ? "text-primary" : "text-white"

  const navLabels = [t.nav.home, t.nav.about, t.nav.services, t.nav.loans, t.nav.savings, t.nav.resources, t.nav.news, t.nav.contact]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024 && mobileOpen) {
        setMobileOpen(false)
      }
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [mobileOpen])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

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
          {/* Language switcher */}
          <div className="relative">
            <button onClick={() => setLangOpen((o) => !o)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                scrolled ? "border-gray-200 text-gray-500 hover:bg-gray-50" : "border-white/20 text-white/80 hover:bg-white/10"
              }`} aria-label="Switch language">
              <Globe className="h-4 w-4" />
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
                        {localeNames[l]}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
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

        <button className={`relative z-50 lg:hidden ${scrolled ? "text-primary" : "text-white"}`}
          onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>
          {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-white/95 backdrop-blur-xl lg:hidden"
            role="dialog" aria-modal="true" aria-label="Mobile navigation">
            {navLabels.map((label, i) => (
              <motion.a key={label} href={navLinkHrefs[i]}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-semibold text-gray-800 transition-colors hover:text-secondary">
                {label}
              </motion.a>
            ))}
            {/* Mobile language + theme */}
            <div className="flex items-center gap-3 mt-2">
              {(["en", "fr", "rw"] as const).map((l) => (
                <button key={l} onClick={() => { setLocale(l); setMobileOpen(false) }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    locale === l ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                  {l.toUpperCase()}
                </button>
              ))}
              <button onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-2 flex flex-col items-center gap-3">
              <a href="/login" onClick={() => setMobileOpen(false)}
                className="rounded-full border-2 border-primary px-8 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white">
                {t.nav.memberLogin}
              </a>
              <a href="/register" onClick={() => setMobileOpen(false)}
                className="btn-primary inline-flex items-center gap-2 px-8 py-2.5 text-sm">
                {t.nav.becomeMember}
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
